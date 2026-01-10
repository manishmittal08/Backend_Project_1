const nodemailer=require("nodemailer");

const transporter=nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

async function sendOrdermail(userEmail,order){
    let productsHtml="";
    order.items.forEach(item => {
        productsHtml+=`
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">
                <span style="font-weight: 600; color: #333;">${item.product.title}</span>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
                ${item.quantity}
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
                <span style="color: #27ae60; font-weight: 600;">₹${item.price}</span>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
                <span style="font-weight: 600;">₹${item.price * item.quantity}</span>
            </td>
        </tr>
       `;
    });

    try {
        await transporter.sendMail({
            from: process.env.EMAIL,
            to: userEmail,
            subject: "🎉 Order Placed Successfully - Order ID: " + order._id,
            html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background-color: #f5f5f5;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 20px auto;
                        background-color: #ffffff;
                        border-radius: 8px;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                        overflow: hidden;
                    }
                    .header {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 40px 20px;
                        text-align: center;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 28px;
                        font-weight: 700;
                    }
                    .header p {
                        margin: 10px 0 0 0;
                        font-size: 14px;
                        opacity: 0.9;
                    }
                    .content {
                        padding: 30px;
                    }
                    .order-id {
                        background-color: #f0f4ff;
                        padding: 15px;
                        border-left: 4px solid #667eea;
                        margin-bottom: 25px;
                        border-radius: 4px;
                    }
                    .order-id p {
                        margin: 0;
                        color: #555;
                    }
                    .order-id .id {
                        font-size: 18px;
                        font-weight: 700;
                        color: #667eea;
                    }
                    .section-title {
                        font-size: 16px;
                        font-weight: 700;
                        color: #333;
                        margin: 25px 0 15px 0;
                        border-bottom: 2px solid #667eea;
                        padding-bottom: 10px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 20px 0;
                    }
                    th {
                        background-color: #f9f9f9;
                        padding: 12px;
                        text-align: left;
                        font-weight: 600;
                        color: #333;
                        border-bottom: 2px solid #ddd;
                    }
                    .summary {
                        background-color: #f9f9f9;
                        padding: 20px;
                        border-radius: 6px;
                        margin: 25px 0;
                    }
                    .summary-row {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 12px;
                        color: #555;
                    }
                    .summary-row.total {
                        font-size: 18px;
                        font-weight: 700;
                        color: #27ae60;
                        border-top: 2px solid #ddd;
                        padding-top: 12px;
                        margin-top: 12px;
                    }
                    .footer {
                        background-color: #f5f5f5;
                        padding: 20px;
                        text-align: center;
                        border-top: 1px solid #ddd;
                    }
                    .footer p {
                        margin: 5px 0;
                        font-size: 13px;
                        color: #888;
                    }
                    .button {
                        display: inline-block;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 12px 30px;
                        border-radius: 6px;
                        text-decoration: none;
                        margin: 20px 0;
                        font-weight: 600;
                    }
                    .button:hover {
                        opacity: 0.9;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✅ Order Confirmed!</h1>
                        <p>Thank you for your purchase</p>
                    </div>
                    
                    <div class="content">
                        <div class="order-id">
                            <p>Order ID: <span class="id">${order._id}</span></p>
                            <p style="margin: 5px 0 0 0; font-size: 13px; color: #777;">Placed on ${new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                        
                        <div class="section-title">📦 Order Details</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th style="text-align: center;">Qty</th>
                                    <th style="text-align: right;">Price</th>
                                    <th style="text-align: right;">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${productsHtml}
                            </tbody>
                        </table>
                        
                        <div class="summary">
                            <div class="summary-row">
                                <span>Subtotal:</span>
                                <span> ₹${order.grandTotal}</span>
                            </div>
                            <div class="summary-row">
                                <span>Discount:</span>
                                <span style="color: #27ae60;"> -₹${order.discountamount || 0}</span>
                            </div>
                            ${order.couponUsed && order.couponDiscount > 0 ? `
                            <div class="summary-row">
                                <span>Coupon (${order.couponUsed}):</span>
                                <span style="color: #27ae60;"> -₹${order.couponDiscount}</span>
                            </div>
                            ` : ''}
                            <div class="summary-row total">
                                <span>Final Amount:</span>
                                <span> ₹${order.finalamount}</span>
                            </div>
                        </div>
                        
                        <div class="section-title">📍 Delivery Address</div>
                        <p style="color: #555; line-height: 1.6; margin: 10px 0;">
                            ${order.address}<br/>
                            <strong>Contact:</strong> ${order.phone}
                        </p>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="#" class="button">Track Your Order</a>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p><strong>Order Status: Placed ✓</strong></p>
                        <p>Your order will be confirmed and dispatched within 24 hours</p>
                        <p>If you have any questions, contact us at ${process.env.EMAIL}</p>
                        <p style="margin-top: 15px; border-top: 1px solid #ddd; padding-top: 15px;">
                            Thank you for shopping with us! 🙏
                        </p>
                    </div>
                </div>
            </body>
            </html>
            `
        });
        console.log("Email sent successfully to:", userEmail);
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}
module.exports=sendOrdermail;