// Install: npm install cloudinary
// Add to .env: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

let cloudinary: any = null;

export const getCloudinary = async () => {
  if (!cloudinary) {
    const { v2 } = await import('cloudinary');
    v2.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key:    process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    cloudinary = v2;
  }
  return cloudinary;
};

export const uploadImage = async (filePath: string, folder: string): Promise<string> => {
  const cld = await getCloudinary();
  const result = await cld.uploader.upload(filePath, { folder });
  return result.secure_url;
};

export const deleteImage = async (publicId: string): Promise<void> => {
  const cld = await getCloudinary();
  await cld.uploader.destroy(publicId);
};
