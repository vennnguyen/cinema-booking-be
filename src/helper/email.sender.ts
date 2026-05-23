import nodemailer from "nodemailer";
import QRCode from "qrcode";
import "dotenv/config";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// Tạo QR từ data string → base64 image
const generateQR = async (data: string): Promise<string> => {
  return await QRCode.toDataURL(data, {
    width: 200,
    margin: 2,
    color: { dark: "#034ea2", light: "#ffffff" },
  });
};

export const sendTicketEmail = async (
  to: string,
  data: {
    userName: string;
    movieName: string;
    cinemaName: string;
    roomName: string;
    releaseDate: string;
    startTime: string;
    seats: string[];
    combos: { name: string; quantity: number; price: number }[];
    totalPrice: number;
    // Truyền vào ticketId hoặc showTimeSeatId để QR có data thật
    ticketIds: number[];
  }
) => {
  // Tạo QR cho từng vé
  const qrImages = await Promise.all(
    data.ticketIds.map((id) =>
      generateQR(
        JSON.stringify({
          ticketId: id,
          movie: data.movieName,
          seat: data.seats[data.ticketIds.indexOf(id)],
          showTime: `${data.releaseDate} ${data.startTime}`,
        })
      )
    )
  );

  const ticketCardsHtml = data.seats
    .map(
      (seat, i) => `
    <div style="
      background:white;
      border:1px solid #e8edf5;
      border-radius:12px;
      overflow:hidden;
      margin-bottom:16px;
      box-shadow:0 2px 8px rgba(3,78,162,0.08);
    ">
      <!-- Ticket header -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#034ea2;border-radius:12px 12px 0 0">
  <tr>
    <td style="padding:14px 20px;vertical-align:middle">
      <div style="color:#a8c4e8;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Ghế</div>
      <div style="color:white;font-size:22px;font-weight:bold;letter-spacing:2px">${seat}</div>
    </td>
    <td align="right" style="padding:14px 20px;vertical-align:middle">
      <div style="color:#a8c4e8;font-size:11px;margin-bottom:4px">Mã vé</div>
      <div style="color:white;font-size:13px;font-weight:600">#${String(data.ticketIds[i]).padStart(6, "0")}</div>
    </td>
  </tr>
</table>

      <!-- Ticket body -->
      <div style="display:flex;align-items:center;padding:16px 20px;gap:20px">
        

        <!-- Divider dashed -->
        <div style="
          width:1px;
          height:100px;
          border-left:2px dashed #dde5f5;
          flex-shrink:0;
        "></div>

        <!-- Info -->
        <div style="flex:1;font-size:13px">
          <div style="margin-bottom:8px">
            <div style="color:#999;font-size:11px;margin-bottom:2px">🎬 Phim</div>
            <div style="font-weight:700;color:#034ea2;font-size:14px">${data.movieName}</div>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:8px">
            <div>
              <div style="color:#999;font-size:11px;margin-bottom:2px">📅 Ngày</div>
              <div style="font-weight:600;color:#333">${data.releaseDate}</div>
            </div>
            <div>
              <div style="color:#999;font-size:11px;margin-bottom:2px">⏰ Suất</div>
              <div style="font-weight:600;color:#333">${data.startTime}</div>
            </div>
          </div>
          <div>
            <div style="color:#999;font-size:11px;margin-bottom:2px">🏛 Rạp</div>
            <div style="font-weight:600;color:#333">${data.cinemaName} · ${data.roomName}</div>
          </div>
        </div>
      </div>

      <!-- Ticket footer — tear line -->
      <div style="
        border-top:2px dashed #e8edf5;
        padding:10px 20px;
        background:#f8faff;
        display:flex;
        justify-content:space-between;
        align-items:center;
      ">
        <span style="font-size:11px;color:#aaa">✂ Xuất trình vé để vào rạp</span>  
      </div>
    </div>
  `
    )
    .join("");

  const combosHtml =
    data.combos.length > 0
      ? `
    <div style="margin-top:24px">
      <div style="
        font-size:14px;font-weight:700;color:#333;
        margin-bottom:12px;padding-bottom:8px;
        border-bottom:2px solid #f0f0f0;
      ">🍿 Combo đã chọn</div>
      ${data.combos
        .map(
          (c) => `
        <div style="
          display:flex;justify-content:space-between;
          align-items:center;padding:10px 0;
          border-bottom:1px solid #f5f5f5;font-size:13px;
        ">
          <div style="color:#444">${c.name}</div>
          <div style="display:flex;align-items:center;gap:12px">
            <span style="
              background:#f0f4ff;color:#034ea2;
              font-size:12px;font-weight:600;
              padding:2px 8px;border-radius:12px;
            ">${c.quantity}x</span>
            <span style="font-weight:700;color:#f58020;min-width:80px;text-align:right">
              ${(c.price * c.quantity).toLocaleString("vi-VN")} ₫
            </span>
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  `
      : "";

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#eef2f7;font-family:'Segoe UI',Arial,sans-serif">
      <div style="max-width:600px;margin:32px auto;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10)">

        <!-- Header -->
        <div style="
          background:linear-gradient(135deg,#034ea2 0%,#0066cc 100%);
          padding:32px 24px;text-align:center;
        ">
          <div style="font-size:36px;margin-bottom:8px">🎬</div>
          <h1 style="color:white;margin:0;font-size:24px;font-weight:700;letter-spacing:0.5px">
            Xác nhận đặt vé thành công
          </h1>
          <p style="color:#a8c4e8;margin:8px 0 0;font-size:14px">
            CinemaX — Trải nghiệm điện ảnh đỉnh cao
          </p>
        </div>

        <!-- Greeting -->
        <div style="background:white;padding:24px 28px 0">
          <p style="margin:0;font-size:15px;color:#444">
            Xin chào <strong style="color:#034ea2">${data.userName}</strong>,
          </p>
          <p style="margin:8px 0 20px;font-size:14px;color:#666;line-height:1.6">
            Cảm ơn bạn đã đặt vé. Dưới đây là thông tin vé của bạn. 
            Vui lòng <strong>xuất trình vé</strong> khi đến rạp.
          </p>
        </div>

        <!-- Ticket Cards -->
        <div style="background:white;padding:0 28px 24px">
          ${ticketCardsHtml}
        </div>

        <!-- Combos + Summary -->
        <div style="background:white;padding:0 28px 28px">
          ${combosHtml}

          <!-- Tổng tiền -->
          <div style="
            margin-top:20px;
            background:linear-gradient(135deg,#fff8f0 0%,#fff3e6 100%);
            border:1px solid #ffd8a8;
            border-radius:10px;
            padding:16px 20px;
            display:flex;
            justify-content:space-between;
            align-items:center;
          ">
            <div>
              <div style="font-size:12px;color:#999;margin-bottom:2px">Đã thanh toán</div>
              <div style="font-size:22px;font-weight:800;color:#f58020">
                ${data.totalPrice.toLocaleString("vi-VN")} ₫
              </div>
            </div>
            
        </div>

        <!-- Note -->
        <div style="
          background:#fffbf0;
          border-top:1px solid #ffe8b0;
          padding:16px 28px;
          font-size:13px;color:#888;
        ">
          <strong style="color:#f58020">⚠ Lưu ý:</strong>
          Vui lòng có mặt trước <strong>15 phút</strong> so với giờ chiếu.
          Vé đã mua không được hoàn trả.
        </div>

        <!-- Footer -->
        <div style="
          background:#1a1a2e;
          padding:20px 28px;
          text-align:center;
        ">
          <div style="color:white;font-size:15px;font-weight:700;margin-bottom:4px">
            🎬 CinemaX
          </div>
          <div style="color:#666;font-size:12px;margin-bottom:8px">
            Mọi thắc mắc liên hệ:
            <a href="mailto:tuan100205@gmail.com" style="color:#a8c4e8">tuan100205@gmail.com</a>
          </div>
          <div style="color:#444;font-size:11px">
            © 2025 CinemaX. All rights reserved.
          </div>
        </div>

      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"CinemaX 🎬" <${process.env.GMAIL_USER}>`,
    to,
    subject: `🎟 Vé xem phim: ${data.movieName} — ${data.releaseDate} ${data.startTime}`,
    html,
  });
};
export const sendOTPEmail = async (to: string, otp: string) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto">
      <div style="background:#034ea2;padding:24px;text-align:center;border-radius:12px 12px 0 0">
        <h1 style="color:white;margin:0;font-size:20px">🎬 CinemaX</h1>
        <p style="color:#a8c4e8;margin:6px 0 0;font-size:13px">Xác thực đăng nhập</p>
      </div>

      <div style="background:white;padding:32px;border:1px solid #e8edf5;border-top:none">
        <p style="color:#444;font-size:15px;margin:0 0 20px">
          Mã OTP của bạn là:
        </p>

        <!-- OTP Box -->
        <div style="text-align:center;margin:24px 0">
          <div style="
            display:inline-block;
            background:#f0f4ff;
            border:2px dashed #034ea2;
            border-radius:12px;
            padding:16px 40px;
          ">
            <span style="
              font-size:36px;
              font-weight:800;
              letter-spacing:12px;
              color:#034ea2;
            ">${otp}</span>
          </div>
        </div>

        <p style="color:#888;font-size:13px;text-align:center;margin:0">
          Mã có hiệu lực trong <strong style="color:#f58020">5 phút</strong>.
          Không chia sẻ mã này cho bất kỳ ai.
        </p>
      </div>

      <div style="background:#f0f0f0;padding:14px;text-align:center;
        font-size:12px;color:#999;border-radius:0 0 12px 12px">
        Nếu bạn không yêu cầu mã này, hãy bỏ qua email này.
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"CinemaX 🎬" <${process.env.GMAIL_USER}>`,
    to,
    subject: `🔐 Mã OTP đăng nhập CinemaX: ${otp}`,
    html,
  });
};