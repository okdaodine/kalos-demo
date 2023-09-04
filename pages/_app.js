import "../styles/globals.css";
import '@radix-ui/themes/styles.css';

import { Theme } from '@radix-ui/themes';

export default function App({ Component, pageProps }) {
  return (
    <Theme appearance="dark" grayColor="sand" radius="large" accentColor="cyan" >
      <Component {...pageProps} />
    </Theme>
  );
}
