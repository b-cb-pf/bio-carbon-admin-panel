import Image from "next/image";

const sizes = { template: 20, master: 20, history: 20, upload: 20, publish: 16, delete: 16 } as const;

export function MaintenanceIcon({ name }: { name: keyof typeof sizes }) {
  return <Image src={`/assets/maintenance/${name}.svg`} alt="" width={sizes[name]} height={sizes[name]} unoptimized />;
}
