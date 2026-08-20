import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = { title: { default: 'Notre Voie — Info en direct', template: '%s · Info en direct' } };

// « Info en direct » — copie de départ du Quotidien (mêmes rubriques,
// mêmes contenus), destinée à devenir la rédaction distincte qui anime le
// site au quotidien avec un style éditorial propre et de nouvelles
// rubriques. Pour l'instant, doublon volontaire à faire diverger ensuite.
export default function InfoDirectLayout({ children }) {
  return (
    <div className="theme-direct bg-[#0a0e1a] text-[#E7EBF7] min-h-screen">
      <Header basePath="/info-direct" />
      <main>{children}</main>
      <Footer basePath="/info-direct" />
    </div>
  );
}
