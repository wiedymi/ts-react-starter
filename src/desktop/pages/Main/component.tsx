import React from 'react'
import Layout from 'desktop/components/Layout'
import Header from 'desktop/components/Header'
import * as S from './styles'

type Props = {
  children: ReactNode
}

function Main(props: Props) {
  return (
    <Layout>
      <Header />
      <S.Main>Desktop</S.Main>
    </Layout>
  )
}

export default Main
