#!/usr/bin/env python3
"""
Printer Client for Repair Café Ticketing System
Connects to the Next.js Socket.IO server to receive print jobs
"""

import os
import sys
import time
import logging
import warnings
from typing import Dict, Any
from dotenv import load_dotenv
import socketio
import urllib3

# Load environment variables
load_dotenv()

# Configuration
SOCKETIO_URL = os.getenv('SOCKETIO_URL', 'http://localhost:3000')
PRINTER_NAME = os.getenv('PRINTER_NAME', 'Printer-01')
SSL_VERIFY = os.getenv('SSL_VERIFY', 'true').lower() in ('true', '1', 'yes')

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('PrinterClient')

# Disable urllib3 SSL warnings in development
if SSL_VERIFY is False:
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


class PrinterClient:
    """Socket.IO client for receiving print jobs"""
    
    def __init__(self, server_url: str, printer_name: str, ssl_verify: bool = True):
        self.server_url = server_url
        self.printer_name = printer_name
        self.printer_id = None
        self.ssl_verify = ssl_verify
        
        # Configure SSL verification
        if not ssl_verify:
            logger.warning('SSL certificate verification is DISABLED - use only in development!')
        
        # Enable debug logging if environment variable is set
        enable_debug = os.getenv('DEBUG', 'false').lower() in ('true', '1', 'yes')
        
        self.sio = socketio.Client(
            reconnection=True,
            reconnection_attempts=0,  # Infinite attempts
            reconnection_delay=1,
            reconnection_delay_max=5,
            logger=enable_debug,
            engineio_logger=enable_debug,
            ssl_verify=ssl_verify
        )
        
        # Register event handlers
        self._register_handlers()
    
    def _register_handlers(self):
        """Register Socket.IO event handlers"""
        
        @self.sio.event
        def connect():
            logger.info(f'Connected to server: {self.server_url}')
            # Register this printer with the server
            self.sio.emit('register-printer', {'printerNaam': self.printer_name})
        
        @self.sio.event
        def disconnect():
            logger.warning('Disconnected from server')
        
        @self.sio.event
        def connect_error(data):
            logger.error(f'Connection error: {data}')
        
        @self.sio.on('printer-registered')
        def on_printer_registered(data: Dict[str, Any]):
            """Printer successfully registered"""
            self.printer_id = data.get('printerId')
            printer_name = data.get('printerNaam')
            logger.info(f'Printer registered: {printer_name} (ID: {self.printer_id})')
        
        @self.sio.on('print-job')
        def on_print_job(data: Dict[str, Any]):
            """Received a new print job"""
            logger.info(f'Received print job: {data}')
            self._handle_print_job(data)
        
        @self.sio.on('print-ack')
        def on_print_ack(data: Dict[str, Any]):
            """Print job acknowledgment"""
            print_job_id = data.get('printJobId')
            status = data.get('status')
            logger.info(f'Print job {print_job_id} acknowledged with status: {status}')
        
        @self.sio.on('print-status-update')
        def on_print_status_update(data: Dict[str, Any]):
            """Print status update broadcast"""
            logger.info(f'Print status update: {data}')
        
        @self.sio.on('error')
        def on_error(data: Dict[str, Any]):
            """Error from server"""
            message = data.get('message', 'Unknown error')
            logger.error(f'Server error: {message}')
    
    def _handle_print_job(self, data: Dict[str, Any]):
        """
        Handle incoming print job
        
        Expected data format:
        {
            'printJobId': int,
            'volgnummer': str,
            'klantNaam': str,
            'klantTelefoon': str | None,
            'afdelingNaam': str
        }
        """
        print_job_id = data.get('printJobId')
        volgnummer = data.get('volgnummer')
        klant_naam = data.get('klantNaam')
        klant_telefoon = data.get('klantTelefoon')
        afdeling_naam = data.get('afdelingNaam')
        
        logger.info('='*60)
        logger.info(f'PRINT JOB #{print_job_id}')
        logger.info('-'*60)
        logger.info(f'Volgnummer:    {volgnummer}')
        logger.info(f'Klant:         {klant_naam}')
        logger.info(f'Telefoon:      {klant_telefoon or "N/A"}')
        logger.info(f'Afdeling:      {afdeling_naam}')
        logger.info('='*60)
        
        # Simulate printing process
        try:
            # TODO: Replace with actual printer logic
            self._print_ticket(volgnummer, klant_naam, klant_telefoon, afdeling_naam)
            
            # Notify server of successful print
            self.sio.emit('print-completed', {'printJobId': print_job_id})
            logger.info(f'Print job {print_job_id} completed successfully')
            
        except Exception as e:
            # Notify server of print failure
            error_msg = str(e)
            logger.error(f'Print job {print_job_id} failed: {error_msg}')
            self.sio.emit('print-failed', {
                'printJobId': print_job_id,
                'errorMessage': error_msg
            })
    
    def _print_ticket(self, volgnummer: str, klant_naam: str, 
                      klant_telefoon: str | None, afdeling_naam: str):
        """
        Print the ticket
        
        TODO: Implement actual printer logic here
        This is a placeholder that simulates printing
        """
        # Simulate print delay
        time.sleep(1)
        
        # Example: Print to console (replace with actual printer code)
        ticket = f"""
╔════════════════════════════════════════╗
║     REPAIR CAFÉ - TICKET               ║
╠════════════════════════════════════════╣
║                                        ║
║  Volgnummer:  {volgnummer:<23}  ║
║                                        ║
║  Klant:       {klant_naam:<23}  ║
║  Telefoon:    {(klant_telefoon or 'N/A'):<23}  ║
║  Afdeling:    {afdeling_naam:<23}  ║
║                                        ║
╚════════════════════════════════════════╝
        """
        print(ticket)
        
        # TODO: Add your printer implementation here
        # Examples:
        # - Use python-escpos for ESC/POS thermal printers
        # - Use win32print for Windows printers
        # - Use CUPS for Linux printers
        # - Use python-brother-ql for Brother QL label printers
    
    def connect(self):
        """Connect to the Socket.IO server"""
        socketio_path = '/api/printer-socketio'
        full_url = f'{self.server_url}'
        
        logger.info(f'Connecting to {full_url} with path {socketio_path}')
        logger.info(f'Printer name: {self.printer_name}')
        
        try:
            # First, initialize the Socket.IO server by fetching the endpoint
            import requests
            init_url = f'{full_url}{socketio_path}'
            logger.debug(f'Initializing Socket.IO server at {init_url}')
            
            try:
                response = requests.get(init_url, verify=self.ssl_verify, timeout=5)
                logger.debug(f'Initialization response: {response.status_code}')
            except requests.exceptions.RequestException as req_error:
                logger.warning(f'Initialization request failed (this may be normal): {req_error}')
            
            # Small delay to ensure server is initialized
            time.sleep(0.5)
            
            # Now connect with Socket.IO client
            logger.debug('Attempting Socket.IO connection...')
            self.sio.connect(
                full_url,
                socketio_path=socketio_path,
                wait_timeout=10,
                transports=['websocket', 'polling']
            )
            logger.info('Successfully connected!')
        except ConnectionError as e:
            logger.error(f'Connection failed: {e}')
            logger.error('Make sure the Next.js server is running and accessible')
            raise
        except TimeoutError as e:
            logger.error(f'Connection timeout: {e}')
            logger.error('The server did not respond in time')
            raise
        except IndexError as e:
            logger.error(f'IndexError during connection: {e}')
            logger.error('The server returned an empty or invalid Socket.IO handshake response.')
            logger.error('')
            logger.error('This usually means:')
            logger.error('  1. The Socket.IO server is not properly initialized on the Next.js side')
            logger.error('  2. The endpoint exists but is not handling Socket.IO protocol correctly')
            logger.error('  3. There may be middleware interfering with the Socket.IO connection')
            logger.error('')
            logger.error('Please check the Next.js server logs for any errors.')
            import traceback
            logger.debug(traceback.format_exc())
            raise
        except Exception as e:
            logger.error(f'Failed to connect: {e}')
            logger.error(f'Error type: {type(e).__name__}')
            import traceback
            logger.debug(traceback.format_exc())
            logger.error('Check that:')
            logger.error('  1. The Next.js server is running')
            logger.error('  2. The /api/printer-socketio endpoint is accessible')
            logger.error('  3. The SOCKETIO_URL in .env is correct')
            logger.error('  4. The Socket.IO server is properly initialized on the Next.js side')
            raise
    
    def disconnect(self):
        """Disconnect from the Socket.IO server"""
        if self.sio.connected:
            logger.info('Disconnecting from server...')
            self.sio.disconnect()
    
    def wait(self):
        """Wait for events (blocking)"""
        try:
            self.sio.wait()
        except KeyboardInterrupt:
            logger.info('Keyboard interrupt received')
            self.disconnect()


def main():
    """Main entry point"""
    logger.info('='*60)
    logger.info('Repair Café Printer Client')
    logger.info('='*60)
    logger.info(f'Server URL: {SOCKETIO_URL}')
    logger.info(f'Printer Name: {PRINTER_NAME}')
    logger.info(f'SSL Verify: {SSL_VERIFY}')
    logger.info('='*60)
    
    # Create and start the printer client
    client = PrinterClient(SOCKETIO_URL, PRINTER_NAME, SSL_VERIFY)
    
    try:
        client.connect()
        logger.info('Printer client running. Press Ctrl+C to exit.')
        client.wait()
    except KeyboardInterrupt:
        logger.info('Shutting down...')
    except Exception as e:
        logger.error(f'Fatal error: {e}')
        sys.exit(1)
    finally:
        client.disconnect()
        logger.info('Printer client stopped.')


if __name__ == '__main__':
    main()
