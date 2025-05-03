import { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ['@omariosouto/common-http-client'],
  trailingSlash: true,
}
 
export default nextConfig;