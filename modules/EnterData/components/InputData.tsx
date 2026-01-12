import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/common/components/ui/input-otp";

interface InputDataProps {
  digits: number;
  value: void;
  setValue: void;
}

export const InputData = ({ digits }: InputDataProps) => {
  return (
    <InputOTP maxLength={digits} pattern="^[0-9]+$">
      <InputOTPGroup>
        {Array.from({ length: digits }, (_, index) => (
          <InputOTPSlot key={index} index={index} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
};
