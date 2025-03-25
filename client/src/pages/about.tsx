import { Container } from "@/components/ui/container";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Seksioni Hero */}
      <div className="bg-primary text-white py-16">
        <Container>
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Rreth Auto Korea Kosova Import</h1>
            <p className="text-xl opacity-90">
              Platforma juaj e besueshme për të zbuluar vetura cilësore me komunikim të lehtë me shitësit.
            </p>
          </div>
        </Container>
      </div>
      
      {/* Historia jonë */}
      <Container className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-bold mb-4">Historia Jonë</h2>
            <p className="text-neutral-600 mb-4">
              E themeluar në vitin 2023, Auto Korea Kosova Import u krijua me një mision të thjeshtë: ta bëjë më të lehtë gjetjen e veturës tuaj të përsosur, më transparente dhe më të lidhur. Vërejtëm se edhe pse kishte shumë tregje për vetura, pak prej tyre ofronin komunikim të lehtë mes blerësve dhe shitësve.
            </p>
            <p className="text-neutral-600 mb-4">
              Prandaj e ndërtuam Auto Korea Kosova Import me integrim të komunikimit përmes WhatsApp – që ju mundëson lidhje të menjëhershme me rrjetin tonë të shitësve të verifikuar. Nuk ka më pritje për përgjigje me email apo telefonata të shumta. Vetëm komunikim direkt, kur ka më së shumti rëndësi.
            </p>
            <p className="text-neutral-600">
              Platforma jonë vazhdon të rritet, duke lidhur adhuruesit e veturave dhe vozitësit e përditshëm me vetura cilësore në një treg transparent, ku gjetja e veturës tuaj të ardhshme është e thjeshtë, e drejtëpërdrejtë dhe madje argëtuese.
            </p>
          </div>
          <div className="rounded-lg overflow-hidden shadow-lg">
            <img 
              src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80" 
              alt="Salloni i veturave" 
              className="w-full h-auto"
            />
          </div>
        </div>
      </Container>
      
      {/* Vlerat tona */}
      <div className="bg-neutral-50 py-12">
        <Container>
          <h2 className="text-2xl font-bold mb-8 text-center">Vlerat Tona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                {/* Ikonë */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Transparencë</h3>
              <p className="text-neutral-600">
                Ne besojmë në transparencë të plotë në të gjitha shpalljet e veturave, me informacione të qarta dhe përshkrime të ndershme.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Efikasitet</h3>
              <p className="text-neutral-600">
                Ne synojmë efikasitet në çdo aspekt – nga përvoja e shfletimit deri te komunikimi shitës-blerës.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Komunikim</h3>
              <p className="text-neutral-600">
                Ne e vëmë theksin në komunikim të drejtpërdrejtë dhe të menjëhershëm ndërmjet klientëve dhe shitësve përmes WhatsApp.
              </p>
            </div>
          </div>
        </Container>
      </div>
      
      {/* Thirrje për Veprim */}
      <div className="bg-primary bg-opacity-5 py-12">
        <Container>
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Gati për të filluar?</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto mb-8">
              Bashkohuni me mijëra përdorues të kënaqur që kanë gjetur veturën e tyre të përsosur përmes Auto Korea Kosova Import.
            </p>
            <div className="flex justify-center">
              <a href="/browse-cars" className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-md font-medium text-center">
                Shfleto Veturat
              </a>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}
