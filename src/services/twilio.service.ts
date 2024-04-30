import { Twilio } from "twilio";
import config from "config";

class TwilioServices {
  twilioClient = new Twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_ACCOUNT_TOKEN
  );

  public async SendOtp(mobile: string) {
    return await this.twilioClient.verify.v2
      .services(process.env.TWILIO_ACCOUNT_SERVICE_ID)
      .verifications.create({ to: `+91${mobile}`, channel: "sms" });
  }

  public async VerifyOtp({ mobile, otp }: { mobile: string; otp: string }) {
    return await this.twilioClient.verify.v2
      .services(process.env.TWILIO_ACCOUNT_SERVICE_ID)
      .verificationChecks.create({ to: `+91${mobile}`, code: otp });
  }
}

export const TwilioService = new TwilioServices();
