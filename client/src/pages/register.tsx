import { Container } from "@/components/ui/container";
import RegistrationForm from "@/components/registration-form";
import { UserPlus } from "lucide-react";

export default function RegisterPage() {
  return (
    <Container className="py-10">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Create an Account</h1>
          <p className="text-muted-foreground mt-2">
            Sign up to save your favorite cars and get personalized recommendations.
          </p>
        </div>
        
        <div className="bg-card border rounded-lg shadow-sm p-6">
          <RegistrationForm />
        </div>
      </div>
    </Container>
  );
}