import { Container } from "@/components/ui/container";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-primary text-white py-16">
        <Container>
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">About AutoMarket</h1>
            <p className="text-xl opacity-90">
              Your trusted platform for discovering quality vehicles with hassle-free dealer communication.
            </p>
          </div>
        </Container>
      </div>
      
      {/* Our Story */}
      <Container className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-bold mb-4">Our Story</h2>
            <p className="text-neutral-600 mb-4">
              Founded in 2023, AutoMarket was created with a simple mission: to make finding your perfect car easier, 
              more transparent, and more connected. We noticed that while there were many car marketplaces, 
              few offered seamless communication between buyers and dealerships.
            </p>
            <p className="text-neutral-600 mb-4">
              That's why we built AutoMarket with integrated WhatsApp communication - allowing instant connection 
              with our network of verified dealers. No more waiting for email responses or playing phone tag. Just direct, 
              immediate communication when it matters most.
            </p>
            <p className="text-neutral-600">
              Our platform continues to grow, connecting car enthusiasts and everyday drivers with quality vehicles
              in a transparent marketplace where finding your next vehicle is simple, straightforward, and even enjoyable.
            </p>
          </div>
          <div className="rounded-lg overflow-hidden shadow-lg">
            <img 
              src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80" 
              alt="Car showroom" 
              className="w-full h-auto"
            />
          </div>
        </div>
      </Container>
      
      {/* Our Values */}
      <div className="bg-neutral-50 py-12">
        <Container>
          <h2 className="text-2xl font-bold mb-8 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Transparency</h3>
              <p className="text-neutral-600">
                We believe in complete transparency in all vehicle listings, with clear information and honest descriptions.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Efficiency</h3>
              <p className="text-neutral-600">
                We strive for efficiency in every aspect, from browsing experience to dealer-customer communication.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Communication</h3>
              <p className="text-neutral-600">
                We prioritize direct, immediate communication between customers and dealers through WhatsApp integration.
              </p>
            </div>
          </div>
        </Container>
      </div>
      
      {/* Our Team */}
      <Container className="py-12">
        <h2 className="text-2xl font-bold mb-8 text-center">Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&h=256&q=80" 
                alt="John Davis" 
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-lg font-bold">John Davis</h3>
            <p className="text-neutral-500">CEO & Founder</p>
          </div>
          
          <div className="text-center">
            <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4">
              <img 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&h=256&q=80" 
                alt="Sarah Johnson" 
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-lg font-bold">Sarah Johnson</h3>
            <p className="text-neutral-500">Chief Operations Officer</p>
          </div>
          
          <div className="text-center">
            <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4">
              <img 
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&h=256&q=80" 
                alt="Michael Lee" 
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-lg font-bold">Michael Lee</h3>
            <p className="text-neutral-500">Head of Technology</p>
          </div>
          
          <div className="text-center">
            <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4">
              <img 
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&h=256&q=80" 
                alt="Emma Martinez" 
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-lg font-bold">Emma Martinez</h3>
            <p className="text-neutral-500">Marketing Director</p>
          </div>
        </div>
      </Container>
      
      {/* Call to Action */}
      <div className="bg-primary bg-opacity-5 py-12">
        <Container>
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto mb-8">
              Join thousands of satisfied users who have found their perfect car through AutoMarket's curated selection.
            </p>
            <div className="flex justify-center">
              <a href="/browse-cars" className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-md font-medium text-center">
                Browse Cars
              </a>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}
