import MobileDetect from 'mobile-detect'

export function isUserAgentMobile(userAgent: string) {
  const md = new MobileDetect(userAgent)

  return Boolean(md.mobile() || md.tablet())
}
