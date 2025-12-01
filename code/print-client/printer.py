"""
Printer module for TM-T88IV thermal printer communication
Handles low-level printer communication via network socket
"""

import socket
import logging
from typing import Optional

logger = logging.getLogger('PrinterClient.Printer')


class PrinterCommunicationError(Exception):
    """Exception raised for printer communication errors"""
    pass


class ThermalPrinter:
    """Handler for TM-T88IV thermal printer communication"""
    
    def __init__(self, printer_ip: str, printer_port: int):
        """
        Initialize printer connection parameters
        
        Args:
            printer_ip: IP address of the printer
            printer_port: Network port of the printer (typically 9100)
        """
        self.printer_ip = printer_ip
        self.printer_port = printer_port
        self.timeout = 5  # Socket timeout in seconds
    
    def send_raw_data(self, data: bytes) -> None:
        """
        Send raw data to the printer via network socket
        
        Args:
            data: Raw bytes to send to printer
            
        Raises:
            PrinterCommunicationError: If connection or sending fails
        """
        sock = None
        try:
            # Create socket connection
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(self.timeout)
            
            logger.info(f'Connecting to printer at {self.printer_ip}:{self.printer_port}')
            sock.connect((self.printer_ip, self.printer_port))
            
            # Send data
            sock.sendall(data)
            logger.info('Print data sent successfully')
            
        except socket.timeout:
            error_msg = f'Printer connection timeout at {self.printer_ip}:{self.printer_port}'
            logger.error(error_msg)
            raise PrinterCommunicationError(error_msg)
            
        except socket.error as e:
            error_msg = f'Failed to connect to printer: {e}'
            logger.error(f'Socket error: {e}')
            raise PrinterCommunicationError(error_msg)
            
        except Exception as e:
            error_msg = f'Unexpected printer error: {e}'
            logger.error(error_msg)
            raise PrinterCommunicationError(error_msg)
            
        finally:
            if sock:
                try:
                    sock.close()
                except Exception as e:
                    logger.warning(f'Error closing socket: {e}')
    
    def test_connection(self) -> bool:
        """
        Test connection to the printer
        
        Returns:
            True if connection successful, False otherwise
        """
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(self.timeout)
            sock.connect((self.printer_ip, self.printer_port))
            sock.close()
            logger.info('Printer connection test successful')
            return True
        except Exception as e:
            logger.warning(f'Printer connection test failed: {e}')
            return False
