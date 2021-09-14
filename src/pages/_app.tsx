import { AppProps } from 'next/app';
import { ApolloProvider } from '@apollo/client';
import { Provider as ReduxProvider } from 'react-redux';

import store from '../redux/store';

import './_app.scss';

import i18n, { initialI18nSettings, Language } from '../libold/i18n';
import { useApollo } from '../libold/apollo';
import { ThemeProvider } from 'src/theme/ThemeProvider';

i18n.init({
  ...initialI18nSettings,
  lng: Language.EN,
});

const App = ({ Component, pageProps }: AppProps) => {
  const apolloClient = useApollo(pageProps);

  return (
    <ThemeProvider>
      <ReduxProvider store={store}>
        <ApolloProvider client={apolloClient}>
          <Component {...pageProps} />
        </ApolloProvider>
      </ReduxProvider>
    </ThemeProvider>
  );
};

export default App;
