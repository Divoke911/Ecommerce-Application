import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#172337] text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

          <div>
            <h4 className="text-gray-200 text-xs font-semibold uppercase mb-4">
              About
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="#" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Press</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Flipkart Stories</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-gray-200 text-xs font-semibold uppercase mb-4">
              Help
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="#" className="hover:text-white transition-colors">Payments</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Shipping</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Cancellation & Returns</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-gray-200 text-xs font-semibold uppercase mb-4">
              Policy
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="#" className="hover:text-white transition-colors">Return Policy</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Terms of Use</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Security</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Privacy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-gray-200 text-xs font-semibold uppercase mb-4">
              Social
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="#" className="hover:text-white transition-colors">Facebook</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Twitter</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">YouTube</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Instagram</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm">
            <span className="text-gray-200 font-bold text-lg italic">Flipkart</span>
            <span>© 2026 Flipkart.com</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-2 border border-gray-600 px-3 py-1 rounded">
              🔒 <span>Secured</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;