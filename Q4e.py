import numpy as np


def project_point_to_pixels(fx, fy, ox, oy, W, H, n, f, Pc):
    """
    Computes the pixel coordinates (u, v) for a 3D point in camera coordinates.

    Args:
        fx (float): Focal length in the x-axis (in pixels).
        fy (float): Focal length in the y-axis (in pixels).
        ox (float): Principal point offset in the x-axis (in pixels).
        oy (float): Principal point offset in the y-axis (in pixels).
        W (int): Viewport width in pixels.
        H (int): Viewport height in pixels.
        n (float): Near clipping plane distance.
        f (float): Far clipping plane distance.
        Pc (list or tuple): The 3D point in camera coordinates [x, y, z].

    Returns:
        tuple: The computed pixel coordinates (u, v).
    """

    # Step 1: Construct the OpenGL projection matrix based on camera intrinsics.
    # This corresponds to the formula requested in Q4.a and implemented in Q4.b.
    M_proj = np.array([
        [2 * fx / W, 0, (W - 2 * ox) / W, 0],
        [0, 2 * fy / H, -(H - 2 * oy) / H, 0],
        [0, 0, -(f + n) / (f - n), -2 * f * n / (f - n)],
        [0, 0, -1, 0]
    ])

    # Step 2: Convert the 3D camera point into homogeneous coordinates by adding a 1.
    Pc_homo = np.array([Pc[0], Pc[1], Pc[2], 1.0])

    # Step 3: Transform the point from camera space to clip space by multiplying with the projection matrix.
    # This corresponds to the first part of the calculation in Q4.c.
    P_clip = M_proj @ Pc_homo

    # Step 4: Perform the perspective divide by dividing by the 'w' component of the clip space coordinates.
    # The result is the Normalized Device Coordinates (NDC). This is the second part of Q4.c.
    w_clip = P_clip[3]
    if w_clip == 0:
        # Avoid division by zero, although with a perspective projection, w will be -z_camera.
        # This case is unlikely for points in front of the camera.
        return None

    x_ndc = P_clip[0] / w_clip
    y_ndc = P_clip[1] / w_clip
    # The z_ndc component (P_clip[2] / w_clip) is used for depth testing but not for calculating pixel coordinates.

    # Step 5: Convert the NDC to final screen (pixel) coordinates.
    # This corresponds to the calculation in Q4.d.
    u = 0.5 * (x_ndc + 1.0) * W
    v = 0.5 * (y_ndc + 1.0) * H

    # Note: Some graphics APIs (like standard OpenGL) have the (0,0) origin for pixel coordinates at the
    # bottom-left, while others (like DirectX or many UI frameworks) have it at the top-left.
    # The formula given in the assignment calculates 'v' from the bottom edge. If the top-left was the origin,
    # the formula would typically be: v = 0.5 * (-y_ndc + 1.0) * H. We will stick to the provided formula.

    return (u, v)


# --- Main execution block to demonstrate and verify the function ---
if __name__ == "__main__":
    # Define the camera and OpenGL parameters from question Q4.b
    W, H = 640, 480
    n, f = 0.1, 10.0
    fx, fy = 650.0, 650.0
    ox, oy = fx / 2.0, fy / 2.0  # 325.0, 325.0

    # Define the point in camera coordinates from question Q4.c
    Pc = [0.2, -0.2, -9.0]

    # Call the function to perform the entire calculation from Q4.a through Q4.d
    pixel_coords = project_point_to_pixels(fx, fy, ox, oy, W, H, n, f, Pc)

    # Print the results for verification
    print(f"Input Camera Point (Pc): {Pc}")
    if pixel_coords:
        print(f"Calculated Pixel Coordinates (u, v): {pixel_coords}")
