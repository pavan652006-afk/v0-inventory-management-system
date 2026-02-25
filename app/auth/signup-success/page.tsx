import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function SignupSuccessPage() {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Account Created Successfully</CardTitle>
        <CardDescription>
          Check your email to verify your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          We&apos;ve sent a confirmation link to your email address. Please click the link to verify your account and start managing your inventory.
        </p>
        <p className="text-sm text-gray-500">
          Didn&apos;t receive an email? Check your spam folder or contact support.
        </p>
        <Link href="/auth/login">
          <Button variant="outline" className="w-full">
            Back to Sign In
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
