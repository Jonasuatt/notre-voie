import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = { title: { default: 'Notre Voie — Le Quotidien', template: '%s · Le Quotidien' } };

// « Le Quotidien » — la rédaction qui confectionne le journal papier :
// contenu déversé tel que présent dans les PDF, rubriques traditionnelles.
export default function QuotidienLayout({ children }) {
  return (
    <>
      <Header basePath="/quotidien" />
      <main>{children}</main>
      <Footer basePath="/quotidien" />
    </>
  );
}
