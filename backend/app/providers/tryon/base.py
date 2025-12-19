from abc import ABC, abstractmethod

class TryOnProvider(ABC):
    @abstractmethod
    def generate_tryon(self, user_image_path: str, garment_image_path: str, output_path: str, options: dict = None) -> str:
        """
        Generates a try-on image.
        :param user_image_path: Absolute path to user base photo
        :param garment_image_path: Absolute path to garment image
        :param output_path: Absolute path where result should be saved
        :param options: Optional parameters
        :return: Path to the generated image (should match output_path)
        """
        pass
