import { NextRequest, NextResponse } from 'next/server';

const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

export async function POST(request: NextRequest) {
    try {
        // Parse request body once
        let body;
        try {
            body = await request.json();
        } catch (error) {
            return NextResponse.json(
                { success: false, message: 'Invalid request body' },
                { status: 400 }
            );
        }
        
        const { email, otp, type } = body;

        // Validate required fields
        if (!email || !otp || !type) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if API key is configured
        if (!BREVO_API_KEY) {
            console.warn('[Email] BREVO_API_KEY not configured, falling back to console output');
            console.log(`[Email OTP] ${type} for ${email}: ${otp}`);
            return NextResponse.json({
                success: true,
                message: 'OTP generated (email service not configured - check console)',
            });
        }

        const subject = type === 'password_reset' 
            ? 'DonateDAO - Password Reset OTP' 
            : 'DonateDAO - Email Verification OTP';

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 16px; padding: 40px; border: 1px solid #334155;">
            <!-- Logo -->
            <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 15px 25px; border-radius: 12px;">
                    <span style="color: white; font-size: 24px; font-weight: bold;">₳ DonateDAO</span>
                </div>
            </div>

            <!-- Title -->
            <h1 style="color: #f8fafc; text-align: center; font-size: 28px; margin-bottom: 10px;">
                ${type === 'password_reset' ? '🔐 Password Reset' : '✉️ Email Verification'}
            </h1>
            
            <p style="color: #94a3b8; text-align: center; font-size: 16px; margin-bottom: 30px;">
                ${type === 'password_reset' 
                    ? 'You requested to reset your password. Use the OTP below to continue.' 
                    : 'Welcome to DonateDAO! Please verify your email with the OTP below.'}
            </p>

            <!-- OTP Box -->
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px;">
                <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 2px;">Your OTP Code</p>
                <div style="font-size: 42px; font-weight: bold; color: white; letter-spacing: 8px; font-family: monospace;">
                    ${otp}
                </div>
            </div>

            <!-- Warning -->
            <div style="background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 8px; padding: 15px; margin-bottom: 30px;">
                <p style="color: #fbbf24; font-size: 14px; margin: 0; text-align: center;">
                    ⏰ This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.
                </p>
            </div>

            <!-- Info -->
            <p style="color: #64748b; text-align: center; font-size: 14px; margin-bottom: 20px;">
                If you didn't request this, please ignore this email or contact support.
            </p>

            <!-- Footer -->
            <div style="border-top: 1px solid #334155; padding-top: 20px; text-align: center;">
                <p style="color: #475569; font-size: 12px; margin: 0;">
                    © 2025 DonateDAO - Decentralized Donation Platform on Cardano
                </p>
                <p style="color: #475569; font-size: 12px; margin-top: 5px;">
                    Built with ❤️ for the community
                </p>
            </div>
        </div>
    </div>
</body>
</html>`;

        const textContent = `
DonateDAO - ${type === 'password_reset' ? 'Password Reset' : 'Email Verification'}

Your OTP Code: ${otp}

This OTP expires in 10 minutes. Do not share it with anyone.

If you didn't request this, please ignore this email.

© 2025 DonateDAO - Decentralized Donation Platform on Cardano
`;

        const response = await fetch(BREVO_API_URL, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': BREVO_API_KEY,
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                sender: {
                    name: 'DonateDAO',
                    email: 'noreply@donatedao.io',
                },
                to: [{ email }],
                subject,
                htmlContent,
                textContent,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            console.log(`[Email] OTP sent to ${email} for ${type}`);
            return NextResponse.json({ 
                success: true, 
                message: 'OTP sent successfully',
                messageId: data.messageId 
            });
        } else {
            console.error('[Email] Failed to send:', data);
            return NextResponse.json(
                { success: false, message: data.message || 'Failed to send email' },
                { status: 500 }
            );
        }
    } catch (error: any) {
        console.error('[Email] Error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

