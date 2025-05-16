import { useState } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function ContactPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      toast({
        title: "Mesazhi u Dërgua",
        description: "Faleminderit për mesazhin tuaj. Do t'ju kontaktojmë së shpejti!",
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen">
      {/* Seksioni Hero */}
      <div className="bg-primary text-white py-16">
        <Container>
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Na Kontaktoni</h1>
            <p className="text-xl opacity-90">
              Keni pyetje apo sugjerime? Do të donim të dëgjonim nga ju. Na kontaktoni.
            </p>
          </div>
        </Container>
      </div>
      
      {/* Seksioni Kontaktit */}
      <Container className="py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informata Kontakti */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold mb-6">Na Kontaktoni</h2>
            <p className="text-neutral-600 mb-6">
              Keni pyetje rreth blerjes apo shitjes së veturës? Keni nevojë për ndihmë me shpalljen tuaj? Ekipi ynë është këtu për t'ju ndihmuar me çdo pyetje.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin className="text-primary mt-1 mr-3 h-5 w-5" />
                <div>
                  <h3 className="font-medium">Adresa</h3>
                  <p className="text-neutral-600">
                    Rruga Bejte Rexhepi, Drenas, 13000
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="text-primary mt-1 mr-3 h-5 w-5" />
                <div>
                  <h3 className="font-medium">Telefoni</h3>
                  <p className="text-neutral-600">+(383) 45-432-999</p>
                  <p className="text-neutral-600">+(383) 45-255-388</p>
                  <p className="text-neutral-600">+(383) 49-584-504</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Mail className="text-primary mt-1 mr-3 h-5 w-5" />
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p className="text-neutral-600">order.autokorea@gmail.com</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock className="text-primary mt-1 mr-3 h-5 w-5" />
                <div>
                  <h3 className="font-medium">Orari i Punës</h3>
                  <p className="text-neutral-600">E Hënë - E Premte: 9:00 - 18:00</p>
                  <p className="text-neutral-600">E Shtunë: 10:00 - 16:00</p>
                  <p className="text-neutral-600">E Diel: Mbyllur</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="font-medium mb-3">Na Ndiqni</h3>
              <div className="flex space-x-4">
                <a href="https://www.facebook.com/profile.php?id=61572322512366" className="bg-neutral-100 p-2 rounded-full hover:bg-neutral-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                  </svg>
                </a>
                <a href="https://www.instagram.com/auto.korea/" className="bg-neutral-100 p-2 rounded-full hover:bg-neutral-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          {/* Forma e Kontaktit */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-6">Na Dërgoni një Mesazh</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Emri Juaj</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Smith"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email-i Juaj</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Numri i Telefonit</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(383) 44-000-000"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="subject">Subjekti</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Si mund t'ju ndihmojmë?"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="message">Mesazhi</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Na tregoni më shumë rreth kërkesës suaj..."
                    rows={6}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Duke dërguar..." : "Dërgo Mesazhin"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </Container>
      
      {/* Seksioni i Hartës */}
      <div className="h-96 bg-neutral-200 mt-8">
        <div className="w-full h-full flex items-center justify-center bg-neutral-100">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-neutral-400 mx-auto mb-2" />
            <p className="text-neutral-600">Këtu do të shfaqet harta</p>
          </div>
        </div>
      </div>
    </div>
  );
}
