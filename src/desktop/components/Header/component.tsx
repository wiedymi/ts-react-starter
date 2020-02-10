import React from 'react'
import * as S from './styles'

type Props = {
  children: ReactNode
}

function Header(props: Props) {
  return (
    <S.Root>
      <S.Logo>TS React Starter</S.Logo>
    </S.Root>
  )
}

export default Header
