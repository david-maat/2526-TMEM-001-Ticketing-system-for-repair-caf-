#!/usr/bin/env python3
"""
Printer Client for Repair Café Ticketing System
Connects to the Next.js Socket.IO server to receive print jobs

This is the main entry point that orchestrates the different components.
"""

import os
import sys
import logging
import signal
import threading
from typing import Dict, Any
from dotenv import load_dotenv

from socket_client import SocketIOClient
from printer_base import PrinterCommunicationError
from printer_factory import create_printer
from ticket_formatter import TicketFormatter

logger = logging.getLogger('PrinterClient')


class PrintJobHandler:
    """Coordinates print job processing between Socket.IO, formatting, and printing"""
    
    def __init__(
        self,
        socket_client: SocketIOClient,
        printer,  # BasePrinter
        formatter: TicketFormatter
    ):
        """
        Initialize print job handler
        
        Args:
            socket_client: Socket.IO client for server communication
            printer: Printer instance (Network or USB)
            formatter: Ticket formatter for ESC/POS generation
        """
        self.socket_client = socket_client
        self.printer = printer
        self.formatter = formatter
        
        # Register callback with socket client
        self.socket_client.set_print_job_callback(self.handle_print_job)
    
    def handle_print_job(self, data: Dict[str, Any]) -> None:
        """
        Handle incoming print job
        
        Expected data format:
        {
            'printJobId': int,
            'volgnummer': str,
            'klantType': str,
            'afdelingNaam': str,
            'voorwerpBeschrijving': str | None,
            'klachtBeschrijving': str | None,
            'printData': dict | None
        }
        """
        print_job_id = data.get('printJobId')
        volgnummer = data.get('volgnummer')
        klant_type = data.get('klantType')
        afdeling_naam = data.get('afdelingNaam')
        voorwerp_beschrijving = data.get('voorwerpBeschrijving')
        klacht_beschrijving = data.get('klachtBeschrijving')
        print_data = data.get('printData')
        
        # Log the print job data
        self.formatter.log_print_data(print_job_id, data)
        
        try:
            # Format the ticket
            ticket_bytes = self.formatter.format_ticket(
                volgnummer=volgnummer,
                klant_type=klant_type,
                afdeling_naam=afdeling_naam,
                voorwerp_beschrijving=voorwerp_beschrijving,
                klacht_beschrijving=klacht_beschrijving,
                print_data=print_data
            )
            
            # Send to printer
            self.printer.send_raw_data(ticket_bytes)
            
            # Notify server of success
            self.socket_client.emit_print_completed(print_job_id)
            
        except PrinterCommunicationError as e:
            # Notify server of failure
            self.socket_client.emit_print_failed(print_job_id, str(e))
        except Exception as e:
            # Catch any unexpected errors
            error_msg = f'Unexpected error: {e}'
            logger.error(error_msg)
            self.socket_client.emit_print_failed(print_job_id, error_msg)


def setup_logging(debug: bool = False):
    """Setup logging configuration"""
    level = logging.DEBUG if debug else logging.INFO
    
    logging.basicConfig(
        level=level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Disable urllib3 SSL warnings in development if SSL verification is disabled
    if not debug:
        import urllib3
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


def main():
    """Main entry point"""
    # Load environment variables
    load_dotenv()
    
    # Get configuration from environment
    socketio_url = os.getenv('SOCKETIO_URL', 'http://localhost:3000')
    printer_id = os.getenv('PRINTER_NAME', 'Printer-01')
    connection_type = os.getenv('CONNECTION_TYPE', 'network').lower()
    
    # Network printer settings
    printer_ip = os.getenv('PRINTER_IP')
    printer_port = int(os.getenv('PRINTER_PORT', '9100'))
    
    # USB/Windows printer settings
    windows_printer_name = os.getenv('WINDOWS_PRINTER_NAME')
    usb_vendor_id = int(os.getenv('USB_VENDOR_ID', '0x0519'), 16)
    usb_product_id = int(os.getenv('USB_PRODUCT_ID', '0x0003'), 16)
    usb_interface = int(os.getenv('USB_INTERFACE', '0'))
    usb_in_ep = int(os.getenv('USB_IN_EP', '0x81'), 16)
    usb_out_ep = int(os.getenv('USB_OUT_EP', '0x03'), 16)
    
    ssl_verify = os.getenv('SSL_VERIFY').lower() in ('true', '1', 'yes')
    debug = os.getenv('DEBUG', 'true').lower() in ('true', '1', 'yes')
    
    # Setup logging
    setup_logging(debug)
    
    logger.info('='*60)
    logger.info('Repair Café Printer Client')
    logger.info('='*60)
    logger.info('Configuration:')
    logger.info(f'  Server URL: {socketio_url}')
    logger.info(f'  Printer ID: {printer_id}')
    logger.info(f'  Connection Type: {connection_type}')
    if connection_type == 'network':
        logger.info(f'  Printer IP: {printer_ip}')
        logger.info(f'  Printer Port: {printer_port}')
    elif connection_type == 'usb':
        if windows_printer_name:
            logger.info(f'  Windows Printer: {windows_printer_name}')
        else:
            logger.info(f'  USB Vendor ID: {hex(usb_vendor_id)}')
            logger.info(f'  USB Product ID: {hex(usb_product_id)}')
            logger.info(f'  USB Interface: {usb_interface}')
            logger.info(f'  USB In EP: {hex(usb_in_ep)}')
            logger.info(f'  USB Out EP: {hex(usb_out_ep)}')
    logger.info(f'  SSL Verify: {ssl_verify}')
    logger.info(f'  Debug: {debug}')
    logger.info('='*60)
    
    # Initialize components
    socket_client = SocketIOClient(
        server_url=socketio_url,
        printer_name=printer_id,
        ssl_verify=ssl_verify,
        debug=debug
    )
    
    # Create printer based on connection type
    printer = create_printer(
        connection_type=connection_type,
        printer_ip=printer_ip,
        printer_port=printer_port,
        printer_name=windows_printer_name,
        usb_vendor_id=usb_vendor_id,
        usb_product_id=usb_product_id,
        usb_interface=usb_interface,
        usb_in_ep=usb_in_ep,
        usb_out_ep=usb_out_ep
    )
    
    logger.info(f'Printer initialized: {printer.get_connection_info()}')
    
    formatter = TicketFormatter()
    
    # Create print job handler to coordinate components
    _handler = PrintJobHandler(socket_client, printer, formatter)
    
    try:
        socket_client.connect()
        logger.info('Printer client running. Press Ctrl+C to exit.')
        
        # Run the wait method in a separate thread
        wait_thread = threading.Thread(target=socket_client.wait, daemon=True)
        wait_thread.start()
        
        # Keep the main thread alive to listen for KeyboardInterrupt
        while wait_thread.is_alive():
            wait_thread.join(timeout=1)
    
    except KeyboardInterrupt:
        logger.info('Shutting down...')
    except Exception as e:
        logger.error(f'Fatal error: {e}')
        sys.exit(1)
    finally:
        socket_client.disconnect()
        logger.info('Printer client stopped.')


if __name__ == '__main__':
    # Signal handler for clean exit on Ctrl+C
    def handle_sigint(signal_received, frame):
        logger.info('SIGINT received. Shutting down...')
        sys.exit(0)

    # Register the signal handler
    signal.signal(signal.SIGINT, handle_sigint)

    main()
