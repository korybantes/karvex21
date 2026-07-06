import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="tr">
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Fleet Management System for Transportation Companies" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
