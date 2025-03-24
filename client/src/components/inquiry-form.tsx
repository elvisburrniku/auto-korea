import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { InsertContactMessage, insertContactSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface InquiryFormProps {
  carId: number;
  carName: string;
}

export default function InquiryForm({ carId, carName }: InquiryFormProps) {
  const { toast } = useToast();

  const form = useForm<InsertContactMessage>({
    resolver: zodResolver(insertContactSchema),
    defaultValues: {
      carId,
      name: "",
      email: "",
      phone: "",
      subject: `Kërkesë për informacion mbi ${carName}`,
      message: `Jam i interesuar për ${carName}. Ju lutem më jepni më shumë informacion.`,
    }
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: InsertContactMessage) => {
      const response = await apiRequest("POST", "/api/contact", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Mesazhi u Dërgua",
        description: "Kërkesa juaj është dërguar me sukses te shitësi.",
      });
      form.reset({
        carId,
        name: "",
        email: "",
        phone: "",
        subject: `Kërkesë për informacion mbi ${carName}`,
        message: `Jam i interesuar për ${carName}. Ju lutem më jepni më shumë informacion.`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/contact/${carId}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Gabim",
        description: error.message || "Dështim në dërgimin e mesazhit. Ju lutem provoni përsëri.",
        variant: "destructive",
      });
    }
  });

  function onSubmit(data: InsertContactMessage) {
    mutate(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Emri Juaj</FormLabel>
              <FormControl>
                <Input placeholder="John Smith" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Juaj</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Numri i Telefonit (Opsional)</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="+1 (555) 123-4567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subjekti</FormLabel>
              <FormControl>
                <Input placeholder="Kërkesë për informacion mbi makinën" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mesazhi</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Jam i interesuar për këtë makinë..." 
                  rows={4} 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Dërgimi..." : "Dërgo Mesazhin"}
        </Button>
      </form>
    </Form>
  );
}
