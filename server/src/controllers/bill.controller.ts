import { Request, Response } from 'express';
import crypto from 'crypto';
import { BillModel } from '../models/Bill.model';
import { OrderModel } from '../models/Order.model';
import { TableModel } from '../models/Table.model';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendError } from '../utils/response';
import { broadcastToRestaurant } from '../utils/websocket';

// POST /api/bills — staff generates bill for a table's order
export const generateBill = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.body;

  const order = await OrderModel.findById(orderId);
  if (!order) { sendError(res, 'Order not found', 404); return; }

  const existingBill = await BillModel.findOne({ orderId });
  if (existingBill) { sendSuccess(res, existingBill, 200, 'Bill already exists'); return; }

  const bill = await BillModel.create({
    restaurantId:       order.restaurantId,
    tableId:            order.tableId,
    orderId:            order._id,
    totalPayableAmount: order.totalAmount,
  });

  broadcastToRestaurant(order.restaurantId.toString(), {
    event: 'bill:generated',
    restaurantId: order.restaurantId.toString(),
    payload: bill,
  });

  sendSuccess(res, bill, 201, 'Bill generated');
});

// GET /api/bills/table/:tableId — customer views their bill
export const getTableBill = asyncHandler(async (req: Request, res: Response) => {
  const bill = await BillModel.findOne({ tableId: req.params.tableId })
    .sort({ generatedAt: -1 }) // get most recent
    .populate('orderId');
  if (!bill) { sendError(res, 'No bill found', 404); return; }
  sendSuccess(res, bill);
});

// POST /api/bills/create-payment — create Razorpay order
export const createPaymentOrder = asyncHandler(async (req: Request, res: Response) => {
  const { billId } = req.body;

  const bill = await BillModel.findById(billId);
  if (!bill) { sendError(res, 'Bill not found', 404); return; }
  if (bill.isPaid) { sendError(res, 'Bill already paid', 400); return; }

  const { getRazorpay } = await import('../config/razorpay');
  const razorpay = await getRazorpay();

  const rpOrder = await razorpay.orders.create({
    amount:   Math.round(bill.totalPayableAmount * 100), // paise
    currency: 'INR',
    receipt:  `bill_${bill._id}`,
  });

  sendSuccess(res, { orderId: rpOrder.id, amount: rpOrder.amount, currency: rpOrder.currency });
});

// POST /api/bills/verify-payment — verify Razorpay signature & mark paid
export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  const { billId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const secret = process.env.RAZORPAY_KEY_SECRET || '';
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSig = crypto.createHmac('sha256', secret).update(body).digest('hex');

  if (expectedSig !== razorpay_signature) {
    sendError(res, 'Payment verification failed', 400);
    return;
  }

  const bill = await BillModel.findByIdAndUpdate(
    billId,
    { isPaid: true, paymentId: razorpay_payment_id },
    { new: true }
  );
  if (!bill) { sendError(res, 'Bill not found', 404); return; }

  // Free up the table
  await TableModel.findByIdAndUpdate(bill.tableId, { status: 'available' });

  sendSuccess(res, bill, 200, 'Payment verified');
});

// GET /api/bills/restaurant/:restaurantId — admin views all bills
export const getRestaurantBills = asyncHandler(async (req: Request, res: Response) => {
  const bills = await BillModel.find({ restaurantId: req.params.restaurantId })
    .populate('tableId', 'tableNo')
    .populate('orderId', 'totalAmount items')
    .sort({ generatedAt: -1 });
  sendSuccess(res, bills);
});

// GET /api/bills/:billId/invoice — get full invoice details
export const getInvoice = asyncHandler(async (req: Request, res: Response) => {
  const bill = await BillModel.findById(req.params.billId)
    .populate('orderId')
    .populate('tableId', 'tableNo')
    .populate('restaurantId', 'name address contactNumber contactEmail');

  if (!bill) { sendError(res, 'Bill not found', 404); return; }
  sendSuccess(res, bill);
});
