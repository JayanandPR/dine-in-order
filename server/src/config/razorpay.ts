// Install: npm install razorpay
// Add to .env: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET

let razorpay: any = null;

export const getRazorpay = async () => {
  if (!razorpay) {
    const Razorpay = (await import('razorpay')).default;
    razorpay = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    });
  }
  return razorpay;
};
