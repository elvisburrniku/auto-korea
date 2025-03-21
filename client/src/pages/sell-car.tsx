import { Container } from "@/components/ui/container";
import AddCarForm from "@/components/add-car-form";

export default function SellCarPage() {
  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <Container>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Sell Your Car</h1>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Ready to sell your vehicle? Complete the form below to create a listing on AutoMarket.
              Potential buyers will be able to contact you via WhatsApp or our inquiry system.
            </p>
          </div>
          
          <AddCarForm />
        </div>
      </Container>
    </div>
  );
}
