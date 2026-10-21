/**
 * Vercel Serverless Function: Xác thực Google ID Token (JWT) ở Back-end
 * Chuẩn Google Identity Services (GIS)
 * Endpoint: POST /api/auth/google
 */

export default async function handler(req: any, res: any) {
  // Thiết lập CORS cho phép gọi từ giao diện web
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Phương thức không hợp lệ. Chỉ chấp nhận POST' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { credential, clientId } = body || {};

    if (!credential) {
      return res.status(400).json({ 
        error: 'Thiếu mã thông báo xác thực (Google ID Token / Credential)' 
      });
    }

    // Bước 4 chuẩn: Gửi ID Token đến máy chủ Google OAuth2 để xác minh tính hợp lệ và chữ ký số
    const googleVerifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`;
    const googleRes = await fetch(googleVerifyUrl);

    if (!googleRes.ok) {
      const errInfo = await googleRes.json().catch(() => ({}));
      return res.status(401).json({
        error: 'Mã xác thực Google không hợp lệ hoặc đã hết hạn',
        details: errInfo,
      });
    }

    const payload = await googleRes.json();

    // 1. Kiểm tra nhà phát hành (Issuer)
    if (payload.iss !== 'accounts.google.com' && payload.iss !== 'https://accounts.google.com') {
      return res.status(401).json({ error: 'Nhà phát hành mã không đáng tin cậy' });
    }

    // 2. Kiểm tra hạn dùng của token (Expiration)
    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (payload.exp && Number(payload.exp) < nowInSeconds) {
      return res.status(401).json({ error: 'Mã xác thực đã hết hạn' });
    }

    // 3. Trích xuất thông tin định danh người dùng được Google chứng thực
    const verifiedUser = {
      sub: payload.sub, // ID duy nhất của người dùng trên toàn hệ thống Google
      email: (payload.email || '').toLowerCase(),
      emailVerified: payload.email_verified === 'true' || payload.email_verified === true,
      name: payload.name || payload.given_name || payload.email?.split('@')[0] || 'Giáo viên',
      picture: payload.picture || '',
      locale: payload.locale || 'vi',
    };

    return res.status(200).json({
      success: true,
      message: 'Xác thực Google ID Token thành công',
      user: verifiedUser,
    });
  } catch (err: any) {
    console.error('Lỗi kiểm tra Google ID Token:', err);
    return res.status(500).json({
      error: 'Lỗi xử lý xác thực trên máy chủ',
      message: err.message,
    });
  }
}
