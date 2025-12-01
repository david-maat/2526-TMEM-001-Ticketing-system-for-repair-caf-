"""
Configuration module for Printer Client
Handles loading and validation of environment variables
"""

import os
import logging
from dataclasses import dataclass
from typing import Optional
from dotenv import load_dotenv

logger = logging.getLogger('PrinterClient.Config')


@dataclass
class PrinterConfig:
    """Configuration for the printer client"""
    socketio_url: str
    printer_name: str
    printer_ip: str
    printer_port: int
    ssl_verify: bool
    debug: bool
    
    @classmethod
    def from_env(cls) -> 'PrinterConfig':
        """Load configuration from environment variables"""
        load_dotenv()
        
        socketio_url = os.getenv('SOCKETIO_URL', 'http://localhost:3000')
        printer_name = os.getenv('PRINTER_NAME', 'Printer-01')
        printer_ip = os.getenv('PRINTER_IP', '192.168.1.100')
        printer_port = int(os.getenv('PRINTER_PORT', '9100'))
        ssl_verify = os.getenv('SSL_VERIFY', 'true').lower() in ('true', '1', 'yes')
        debug = os.getenv('DEBUG', 'false').lower() in ('true', '1', 'yes')
        
        config = cls(
            socketio_url=socketio_url,
            printer_name=printer_name,
            printer_ip=printer_ip,
            printer_port=printer_port,
            ssl_verify=ssl_verify,
            debug=debug
        )
        
        config._log_configuration()
        return config
    
    def _log_configuration(self):
        """Log the current configuration"""
        logger.info('='*60)
        logger.info('Configuration:')
        logger.info(f'  Server URL: {self.socketio_url}')
        logger.info(f'  Printer Name: {self.printer_name}')
        logger.info(f'  Printer IP: {self.printer_ip}')
        logger.info(f'  Printer Port: {self.printer_port}')
        logger.info(f'  SSL Verify: {self.ssl_verify}')
        logger.info(f'  Debug: {self.debug}')
        logger.info('='*60)


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
