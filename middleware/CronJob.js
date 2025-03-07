const cron = require("node-cron");
const Payment = require("./model/Payment");

// Cron job chạy mỗi 10 giây (cho thử nghiệm)
cron.schedule("*/10 * * * * *", async () => {
  try {
    // Tính thời điểm cách đây 10 giây
    const expiredTime = new Date(Date.now() - 10 * 1000); // 10 giây
    const expiredPayments = await Payment.getExpiredPendingPayments(expiredTime);
    
    if (expiredPayments.length > 0) {
      for (const payment of expiredPayments) {
        await Payment.deletePayment(payment.id);
      }
    } else {
      console.log("No expired pending payments found.");
    }
  } catch (error) {
    console.error("Error in cleanup job:", error);
  }
});
