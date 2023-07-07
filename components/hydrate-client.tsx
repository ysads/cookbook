"use client";

import { Hydrate as RQHydrate, HydrateProps } from "@tanstack/react-query";

function HydrateClient(props: HydrateProps) {
  return <RQHydrate {...props} />;
}

export default HydrateClient;
