import { createContext, useContext } from 'react';

// Portail courant — QUOTIDIEN ou INFO_DIRECT. Les écrans partagés (rubriques,
// articles) s'en servent pour ne montrer que le contenu de l'édition choisie
// à l'entrée de l'app.
const PortailContext = createContext({ portail: 'QUOTIDIEN' });

export const PortailProvider = PortailContext.Provider;
export const usePortail = () => useContext(PortailContext);
