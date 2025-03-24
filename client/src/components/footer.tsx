import { Link } from "wouter";
import { Container } from "@/components/ui/container";
import { Car, MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-neutral-800 text-white pt-12 pb-6">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center mb-4">
              <img src="https://auto-korea.clientlly.com/file/logo?t=1742816556" width="100px" height="auto" className="big-logo"/>
            </div>
            <p className="text-neutral-300 mb-4">
              Porosit makina cilësore nga Korea e Jugut me çmim të lirë dhe cilësi të garantuar.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/profile.php?id=61572322512366" className="text-white hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/auto.korea/" className="text-white hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Linqe të shpejta</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-neutral-300 hover:text-white transition-colors">
                  Ballina
                </Link>
              </li>
              <li>
                <Link href="/browse-cars" className="text-neutral-300 hover:text-white transition-colors">
                  Kërko vetura
                </Link>
              </li>

              <li>
                <Link href="/about" className="text-neutral-300 hover:text-white transition-colors">
                  Rreth Nesh
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-neutral-300 hover:text-white transition-colors">
                  Kontaktoni
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Kategoritë e makinave</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/browse-cars?type=sedan" className="text-neutral-300 hover:text-white transition-colors">
                  Sedanët
                </Link>
              </li>
              <li>
                <Link href="/browse-cars?type=suv" className="text-neutral-300 hover:text-white transition-colors">
                  SUVs
                </Link>
              </li>
              <li>
                <Link href="/browse-cars?type=truck" className="text-neutral-300 hover:text-white transition-colors">
                  SUV
                </Link>
              </li>
              <li>
                <Link href="/browse-cars?type=luxury" className="text-neutral-300 hover:text-white transition-colors">
                  Makina luksoze
                </Link>
              </li>
              <li>
                <Link href="/browse-cars?fuelType=Electric" className="text-neutral-300 hover:text-white transition-colors">
                  Automjete elektrike
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Na kontaktoni</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <MapPin className="mt-1 mr-2 h-4 w-4" />
                <span>Rruga Besim Rexhepi, Ferizaj, 70000</span>
                <span>Rruga Xhevat Demaku, Drenas, 13000</span>
              </li>
              <li className="flex items-center">
                <Phone className="mr-2 h-4 w-4" />
                <a href="tel:+38345432999">+(383) 45-432-999</a>
                <a href="tel:+38345255388">+(383) 45-255-388</a>
                <a href="tel:+38348584504">+(383) 49-584-504</a>
              </li>
              <li className="flex items-center">
                <Mail className="mr-2 h-4 w-4" />
                <span>order.autokorea@gmail.com</span>
              </li>
              <li className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                <span>E hënë-E shtunë: 9:00-18:00</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-neutral-700 pt-6 mt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral-400 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Auto Korea Kosova Import. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-neutral-400 hover:text-white text-sm transition-colors">
              Politika e privatësisë
            </a>
            <a href="#" className="text-neutral-400 hover:text-white text-sm transition-colors">
              Kushtet e Shërbimit
            </a>
            <a href="#" className="text-neutral-400 hover:text-white text-sm transition-colors">
              Politika e cookie
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
