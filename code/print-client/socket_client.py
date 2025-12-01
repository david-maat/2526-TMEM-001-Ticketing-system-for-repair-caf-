"""
Socket.IO client module for printer communication
Handles connection to the Next.js Socket.IO server and event handling
"""

import time
import logging
import requests
from typing import Dict, Any, Callable, Optional
import socketio

logger = logging.getLogger('PrinterClient.SocketIO')


class SocketIOClient:
    """Socket.IO client for receiving print jobs from the server"""
    
    def __init__(
        self,
        server_url: str,
        printer_name: str,
        ssl_verify: bool = True,
        debug: bool = False
    ):
        """
        Initialize Socket.IO client
        
        Args:
            server_url: URL of the Socket.IO server
            printer_name: Name of this printer
            ssl_verify: Whether to verify SSL certificates
            debug: Enable debug logging
        """
        self.server_url = server_url
        self.printer_name = printer_name
        self.printer_id: Optional[int] = None
        self.ssl_verify = ssl_verify
        self.socketio_path = '/api/printer-socketio'
        
        # Callbacks
        self._on_print_job_callback: Optional[Callable[[Dict[str, Any]], None]] = None
        
        if not ssl_verify:
            logger.warning('SSL certificate verification is DISABLED - use only in development!')
        
        # Initialize Socket.IO client
        self.sio = socketio.Client(
            reconnection=True,
            reconnection_attempts=0,  # Infinite attempts
            reconnection_delay=1,
            reconnection_delay_max=5,
            logger=debug,
            engineio_logger=debug,
            ssl_verify=ssl_verify
        )
        
        self._register_handlers()
    
    def set_print_job_callback(self, callback: Callable[[Dict[str, Any]], None]) -> None:
        """
        Set callback for handling print jobs
        
        Args:
            callback: Function to call when a print job is received
        """
        self._on_print_job_callback = callback
    
    def _register_handlers(self) -> None:
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
            if self._on_print_job_callback:
                self._on_print_job_callback(data)
        
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
    
    def connect(self) -> None:
        """Connect to the Socket.IO server"""
        full_url = self.server_url
        
        logger.info(f'Connecting to {full_url} with path {self.socketio_path}')
        logger.info(f'Printer name: {self.printer_name}')
        
        try:
            # First, initialize the Socket.IO server by fetching the endpoint
            init_url = f'{full_url}{self.socketio_path}'
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
                socketio_path=self.socketio_path,
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
            raise
            
        except Exception as e:
            logger.error(f'Failed to connect: {e}')
            logger.error(f'Error type: {type(e).__name__}')
            logger.error('Check that:')
            logger.error('  1. The Next.js server is running')
            logger.error('  2. The /api/printer-socketio endpoint is accessible')
            logger.error('  3. The SOCKETIO_URL in .env is correct')
            logger.error('  4. The Socket.IO server is properly initialized on the Next.js side')
            raise
    
    def disconnect(self) -> None:
        """Disconnect from the Socket.IO server"""
        if self.sio.connected:
            logger.info('Disconnecting from server...')
            self.sio.disconnect()
    
    def emit_print_completed(self, print_job_id: int) -> None:
        """
        Notify server of successful print
        
        Args:
            print_job_id: ID of the completed print job
        """
        self.sio.emit('print-completed', {'printJobId': print_job_id})
        logger.info(f'Print job {print_job_id} completed successfully')
    
    def emit_print_failed(self, print_job_id: int, error_message: str) -> None:
        """
        Notify server of print failure
        
        Args:
            print_job_id: ID of the failed print job
            error_message: Description of the error
        """
        self.sio.emit('print-failed', {
            'printJobId': print_job_id,
            'errorMessage': error_message
        })
        logger.error(f'Print job {print_job_id} failed: {error_message}')
    
    def wait(self) -> None:
        """Wait for events (blocking)"""
        self.sio.wait()
    
    @property
    def is_connected(self) -> bool:
        """Check if client is connected"""
        return self.sio.connected
