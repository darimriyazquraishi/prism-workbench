# perimeter.py

def calculate_perimeter(side_length):
    """
    Calculate the perimeter of a square.

    Args:
        side_length (float): The length of one side of the square in centimeters.

    Returns:
        float: The perimeter of the square in centimeters.
    """
    return 4 * side_length

# Example usage
side_length = 3  # in centimeters
perimeter = calculate_perimeter(side_length)
print(f"The perimeter of the square with side length {side_length} cm is {perimeter} cm.")