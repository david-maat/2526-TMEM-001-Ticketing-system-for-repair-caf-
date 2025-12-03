"""
Base printer interface for thermal printers
Provides abstraction for different connection types (network, USB, etc.)
"""

from abc import ABC, abstractmethod
import logging
from typing import Optional

logger = logging.getLogger('PrinterClient.PrinterBase')


class PrinterCommunicationError(Exception):
    """Exception raised for printer communication errors"""
    pass


class BasePrinter(ABC):
    """Abstract base class for thermal printer implementations"""
    
    @abstractmethod
    def send_raw_data(self, data: bytes) -> None:
        """
        Send raw data to the printer
        
        Args:
            data: Raw bytes to send to printer
            
        Raises:
            PrinterCommunicationError: If connection or sending fails
        """
        pass
    
    @abstractmethod
    def test_connection(self) -> bool:
        """
        Test connection to the printer
        
        Returns:
            True if connection successful, False otherwise
        """
        pass
    
    @abstractmethod
    def get_connection_info(self) -> str:
        """
        Get human-readable connection information
        
        Returns:
            String describing the connection (e.g., "Network: 192.168.1.100:9100")
        """
        pass
