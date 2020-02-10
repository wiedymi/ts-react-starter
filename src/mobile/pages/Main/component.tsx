import React from 'react'
import Layout from 'mobile/components/Layout'
import Header from 'mobile/components/Header'
import * as S from './styles'

type Props = {
  children: ReactNode
}

function Main(props: Props) {
  return (
    <Layout>
      <Header />
      <S.Main>Mobile</S.Main>
    </Layout>
  )
}

export default Main
