#!/usr/bin/env python3
"""
Printer Client for Repair Café Ticketing System
Connects to the Next.js Socket.IO server to receive print jobs

This is the main entry point that orchestrates the different components.
"""

import sys
import logging
import signal
import threading
from typing import Dict, Any

from config import PrinterConfig, setup_logging
from socket_client import SocketIOClient
from printer import ThermalPrinter, PrinterCommunicationError
from ticket_formatter import TicketFormatter

logger = logging.getLogger('PrinterClient')


class PrintJobHandler:
    """Coordinates print job processing between Socket.IO, formatting, and printing"""
    
    def __init__(
        self,
        socket_client: SocketIOClient,
        printer: ThermalPrinter,
        formatter: TicketFormatter
    ):
        """
        Initialize print job handler
        
        Args:
            socket_client: Socket.IO client for server communication
            printer: Thermal printer for physical printing
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


def main():
    """Main entry point"""
    # Load configuration
    config = PrinterConfig.from_env()
    setup_logging(config.debug)
    
    logger.info('='*60)
    logger.info('Repair Café Printer Client')
    logger.info('='*60)
    
    # Initialize components
    socket_client = SocketIOClient(
        server_url=config.socketio_url,
        printer_name=config.printer_name,
        ssl_verify=config.ssl_verify,
        debug=config.debug
    )
    
    printer = ThermalPrinter(
        printer_ip=config.printer_ip,
        printer_port=config.printer_port
    )
    
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
