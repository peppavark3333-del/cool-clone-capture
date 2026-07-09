import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  Phone, MessageCircle, Mail, MapPin, Clock, ShieldCheck, Wrench,
  Snowflake, Wind, Flame, Droplets, Zap, Factory, ArrowRight, CheckCircle2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/rybus-logo.jpeg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rybus — Cool air. Done right. | Cape Town AC & Refrigeration" },
      { name: "description", content: "Qualified air-conditioning, refrigeration, ducting, chillers and electricals — supply, install, service and repair across Cape Town. 24/7 emergency." },
    ],
  }),
  component: Index,
});

const PHONE = "+27822320386";
const PHONE_DISPLAY = "082 232 0386";
const WHATSAPP = "https://wa.me/27822320386";

const services = [
  { icon: Snowflake, title: "Air-conditioning", body: "Midwall splits, under-ceiling, cassettes, multi-split & VRV systems. Supply, installation, repairs & re-gas." },
  { icon: Factory, title: "Refrigeration", body: "Bar fridges, underbars, salad bars, wine coolers, walk-in cold & freezer rooms. Industrial only." },
  { icon: Wind, title: "Ducting & Ventilation", body: "Supply, installation and servicing of ducting, ventilation and extractor fans." },
  { icon: Flame, title: "Heat Pumps", body: "Energy-efficient heat pump supply, installation, repairs and servicing." },
  { icon: Droplets, title: "Glycol & Water Chillers", body: "Supply, installation, repairs and servicing of glycol and water-cooled chillers." },
  { icon: Zap, title: "Electricals & Controllers", body: "All air-conditioning and refrigeration electricals, controllers and gas work — fully qualified." },
  { icon: Wrench, title: "Ice Machines & Compressors", body: "Supply, install, repair and maintain ice machines, compressors and water pumps." },
  { icon: ShieldCheck, title: "Air Curtains & Cooling Towers", body: "Air curtains, cooling towers, air driers and package units — supply, install and service." },
];

const stats = [
  { k: "24/7", v: "Emergency" },
  { k: "Durbanville", v: "Based in" },
  { k: "Cape Town", v: "Coverage" },
  { k: "Certified", v: "Qualified" },
];

const electricals: [string, string][] = [
  ["/img/electrical-1-BfkQdgeN.jpg", "Control panel — heater & sensor circuits"],
  ["/img/electrical-3-CUCJLTdL.jpg", "Contactor & overload bank — chiller plant"],
  ["/img/electrical-4-BhYcr3sm.jpg", "Three-phase distribution & control wiring"],
  ["/img/electrical-7-BGQemPiY.jpg", "Cold room control panel — alarms & thermostats"],
  ["/img/compressor-4-BEZFkX11.jpg", "Refrigeration controllers & relay logic"],
  ["/img/electrical-6-CNDmRa49.jpg", "VSD / inverter drive installation"],
  ["/img/electrical-9-CrSROK_5.jpg", "Compressor & fan output wiring"],
  ["/img/electrical-10-BQr3INNS.jpg", "Carel iPRO BMS controller wiring"],
  ["/img/electrical-2-DKNW9zv9.jpg", "Pressure switch diagnostics"],
  ["/img/electrical-5-Cfh8klKQ.jpg", "PCB fault finding & board repair"],
  ["/img/electrical-11-jD6g_6dO.jpg", "Reletek timer relay & Hager fuse — relay logic build"],
];

const aircurtains: [string, string][] = [
  ["/img/aircurtain-1-CUz0BG8j.jpg", "Thermocold air curtain — retail entrance"],
  ["/img/aircurtain-2-DHyfw3Rb.jpg", "Alliance air curtain — shopfront installation"],
  ["/img/aircurtain-3-DHcUgTH1.jpg", "Alliance air curtain — interior doorway"],
  ["/img/aircurtain-4-D9TNpgsc.jpg", "Heavy-duty perforated air curtain"],
];

const cassettes: [string, string][] = [
  ["/img/cassette-1-C4uKBuYk.jpg", "Daikin ceiling cassette — stripped for deep service"],
  ["/img/cassette-2-2CT3IQit.jpg", "Turbo fan impeller removed for cleaning"],
  ["/img/cassette-3-CPIGRnDc.jpg", "Fan housing — pre-clean inspection"],
  ["/img/cassette-4-B-8zTdKy.jpg", "Cassette face panel & drain pan removed"],
  ["/img/cassette-5-BD3kcCax.jpg", "Daikin FCQG indoor unit — blower & data plate"],
  ["/img/cassette-6-D3vWwshC.jpg", "Evaporator coil — before chemical clean"],
  ["/img/cassette-7-Cm_9J-0k.jpg", "Outdoor unit PCB clean & diagnostics"],
  ["/img/cassette-8-DDpybCJI.jpg", "Inverter board service — capacitors & inductors"],
  ["/img/cassette-9-Buk-uOM6.jpg", "Daikin SkyAir outdoor units — commissioned & running"],
];

const compressors: [string, string][] = [
  ["/img/compressor-7-CiVsDlMt.jpg", "Bitzer semi-hermetic compressor — overhauled & repainted"],
  ["/img/compressor-8-DB7qLnnz.jpg", "Refurbished compressor installed on anti-vibration mounts"],
  ["/img/compressor-5-CIB8Eap5.jpg", "Plant room — compressor & condenser pipework"],
  ["/img/compressor-6-CFyh_1oj.jpg", "Twin Bitzer compressors with insulated suction lines"],
  ["/img/compressor-2-Dn-q66_6.jpg", "Refco gauge panel — Compressor Unit No. 2 (HP / LP / oil)"],
  ["/img/compressor-3-BEpmsGJx.jpg", "Refco gauge panel — Compressor Unit No. 1 (oil / LP / HP)"],
  ["/img/compressor-1-BQ9pruty.jpg", "Johnson Controls Penn dual HP/LP pressure switch"],
  ["/img/compressor-4-BEZFkX11.jpg", "Compressor control panel — contactors, relays & Carel ir33"],
];

const ducts: [string, string][] = [
  ["/img/duct-1-XyoUKQL3.jpg", "Galvanised spiral ducting & flexi connections — manifold takeoff"],
  ["/img/duct-2-Bv-8Cgcp.jpg", "Elta Fans inline extractor — branch ducting installation"],
  ["/img/duct-3-DQTuh2ie.jpg", "S&P TD-1000 Silent inline mixed-flow fan — ceiling void"],
  ["/img/duct-4-DShdaqHL.jpg", "S&P TD-1200 inline duct fan mounted on plant frame"],
  ["/img/duct-5-D_5d4hK1.jpg", "S&P TD Silent — bracketed in ceiling above tile grid"],
  ["/img/duct-6-YNf5vkM8.jpg", "Ceiling supply grille — fresh-air diffuser"],
  ["/img/duct-7-Ch4FEewA.jpg", "Linear bar grille — concealed bulkhead supply"],
  ["/img/duct-8-kcLF04t2.jpg", "Roof-mounted centrifugal extractor cowl"],
  ["/img/duct-9-B8L8NXpY.jpg", "Curvent roof ventilators on profiled metal roof"],
  ["/img/duct-10-Cek7SfNB.jpg", "Vortice Lineo 150 inline duct fan — labelled & certified"],
  ["/img/duct-11-DiZ8Mhqt.jpg", "Insulated flexi & spiral ducting into swirl diffuser — office ceiling"],
  ["/img/duct-12-ClmQvomX.jpg", "Galvanised transition piece — square-to-round riser with insulated flexi"],
  ["/img/duct-13-D8g-PxQ0.jpg", "Wall-mounted box extractor fan — storeroom ventilation"],
  ["/img/duct-14-Crac4l1U.jpg", "External insulated ducting with attenuator & weather louvre"],
  ["/img/duct-15-D5UXUGpX.jpg", "Suspended galvanised plenum box — concealed ceiling supply"],
  ["/img/duct-16-BFDAIiVg.jpg", "Roof-mounted axial extractor with weather cowl — factory wall"],
  ["/img/duct-17-DZo0vJYZ.jpg", "Bank of roof-mounted extraction stacks — workshop ventilation"],
  ["/img/duct-18-D2pi5Yfs.jpg", "Axial flow fan with motor — rooftop installation"],
  ["/img/duct-19-CKrATGeC.jpg", "Heavy-duty external extraction ducting & axial fan — industrial plant"],
  ["/img/duct-20-CblgL4Ou.jpg", "S&P wall-mounted axial extractor fan with safety guard"],
  ["/img/duct-21-BkrXHvAb.jpg", "Ziehl-ebm centrifugal blower units — plant room installation"],
  ["/img/duct-22-DYmerk42.jpg", "Cape Fans roof-mounted centrifugal extractor with cowl"],
];

const fab: [string, string][] = [
  ["/img/fab-3-B3pS0-um.jpg", "Custom galvanised bird & hail guard — welded mesh on sheet collar"],
  ["/img/fab-2-C0MXdYRO.jpg", "Heavy-duty extraction cowl with woven mesh face — workshop build"],
  ["/img/fab-1-BPck_qNt.jpg", "Bird-proof intake grille — galvanised frame with welded mesh"],
  ["/img/fab-4-D3dfBXY-.jpg", "Custom condenser top hail-guard — perforated mesh on galvanised tray"],
  ["/img/fab-5-D_BofUc_.jpg", "Plant-room fitted condenser cowls — fabricated to suit"],
  ["/img/fab-7-CNNd2UTV.jpg", "Bespoke Midea condenser security & guard cage — diamond mesh"],
  ["/img/fab-6-Cp8ybs5C.jpg", "Site-fitted condenser protection cages — outdoor courtyard installation"],
];

const glycol: [string, string][] = [
  ["/img/glycol-5-C96i489o.jpg", "Multi-fan rooftop glycol chiller bank — full installation"],
  ["/img/glycol-6-DYJAPor7.jpg", "EC fan array on packaged chiller — site commissioning"],
  ["/img/glycol-1-Djcke9Xv.jpg", "V-coil condenser & brazed-plate evaporator — chiller end-bay"],
  ["/img/glycol-10-CfO3lYbz.jpg", "Microchannel condenser coil — fouled & due for clean"],
  ["/img/glycol-3-CSMTroKZ.jpg", "Microchannel coil after chemical clean — restored airflow"],
  ["/img/glycol-4-7vAt93Hb.jpg", "Close-up of cleaned fin-pack — heat-transfer recovered"],
  ["/img/glycol-2-t3CO491p.jpg", "Chiller control panel — Carel BMS, contactors & soft-starts"],
  ["/img/glycol-8-CpEKTHQm.jpg", "Glycol/water concentration check — refractometer sample"],
  ["/img/glycol-7-B0X1lHMX.jpg", "Refractometer scale — propylene/ethylene glycol freeze-point reading"],
  ["/img/glycol-9-DTi86HT9.jpg", "Glycol loop strainer & isolation valves — service access"],
  ["/img/glycol-11-B46GBzSJ.jpg", "Winery fermentation tanks — glycol-jacketed temperature control"],
  ["/img/glycol-15-CT_Jguv6.jpg", "Dual evaporator coils — wine cellar climate control"],
  ["/img/glycol-14-D2a5PI3y.jpg", "Wall-mounted evaporators with insulated glycol lines — tasting room"],
  ["/img/glycol-16-DoWcGxJ6.jpg", "Cold-room evaporator pair — glycol-fed dual unit install"],
  ["/img/glycol-17-B-bkUr8Z.jpg", "Thermocoil twin evaporators — cold storage retrofit"],
  ["/img/glycol-12-BqS4Ek8o.jpg", "In-tank 3-phase & 32V outlets — cellar distribution board feed"],
  ["/img/glycol-13-DcwBQu8G.jpg", "Sense IoT monitoring on glycol manifold — live telemetry"],
  ["/img/glycol-18-DHP4bdmU.jpg", "Twin glycol circulation pumps — insulated red flow & return headers"],
  ["/img/glycol-19-CNNfoUdd.jpg", "Bluguard chiller plant-room — pumps, strainer & isolation valves"],
  ["/img/glycol-20-AklNifS6.jpg", "Refractometer reading — glycol freeze-point check"],
];

function Header() {
  const navigate = useNavigate();
  const clicks = useRef<number[]>([]);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const now = Date.now();
    clicks.current = [...clicks.current.filter((t) => now - t < 1500), now];
    if (clicks.current.length >= 5) {
      clicks.current = [];
      navigate({ to: "/admin-login" });
      return;
    }
    if (typeof window !== "undefined") {
      const el = document.getElementById("top");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <div className="bg-hero-gradient text-white text-sm">
        <div className="mx-auto max-w-7xl px-6 py-2 flex items-center justify-between gap-4">
          <a href={`tel:${PHONE}`} className="inline-flex items-center gap-2 hover:text-ice">
            <Phone className="h-3.5 w-3.5" /> {PHONE_DISPLAY}
          </a>
          <a href="#contact" className="inline-flex items-center gap-2 hover:text-ice">
            <Mail className="h-3.5 w-3.5" /> Contact
          </a>
        </div>
      </div>
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <a href="#top" onClick={handleLogoClick} className="flex items-center gap-3 select-none" title="Rybus">
            <img src={logo} alt="Rybus — HVAC & Solar Hot Water" className="h-12 w-12 rounded-xl object-contain bg-white border border-border" />
            <div>
              <div className="font-display font-bold text-lg tracking-tight leading-none">Rybus</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">HVAC & Solar Hot Water</div>
            </div>
          </a>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            <a href="#top" className="hover:text-primary">Home</a>
            <a href="#services" className="hover:text-primary">Services</a>
            <a href="#about" className="hover:text-primary">About</a>
            <a href="#gallery" className="hover:text-primary">Gallery</a>
            <a href="#ducting" className="hover:text-primary">Ducting</a>
            <a href="#chillers" className="hover:text-primary">Chillers</a>
            <a href="#contact" className="hover:text-primary">Contact</a>
          </nav>
          <a href="#contact" className="inline-flex items-center gap-2 rounded-full bg-accent-gradient px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-glow hover:scale-[1.03] transition-transform">
            Get a quote <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </header>
    </>
  );
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-hero-gradient">
      <div className="absolute inset-0 opacity-30">
        <img src="/img/hero-aircon-D3pkx-0b.jpg" alt="" className="h-full w-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-tr from-[color:var(--deep)] via-[color:var(--deep)]/60 to-transparent" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-24 md:grid-cols-2 md:py-32">
        <div className="flex flex-col justify-center text-white">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            Available 24/7 across Cape Town
          </div>
          <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
            Cool air.<br />
            <span className="text-gradient-ice">Done right.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg text-white/80">
            Rybus is a qualified air-conditioning and refrigeration specialist based in Durbanville. From single splits to industrial cold rooms — we supply, install, service and repair.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={`tel:${PHONE}`} className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-[color:var(--deep)] shadow-glow hover:scale-[1.03] transition-transform">
              <Phone className="h-4 w-4" /> Call {PHONE_DISPLAY}
            </a>
            <a href={WHATSAPP} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur hover:bg-white/20">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-white/85">
            {["Fully qualified with papers", "Certified for all refrigeration gases", "24/7 emergency call-out", "Residential & commercial"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="hidden md:block" />
      </div>
      <div className="relative border-t border-white/10 bg-background">
        <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.k} className="border-r border-border last:border-r-0 px-6 py-8 text-center">
              <div className="font-display text-3xl font-bold text-primary">{s.k}</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="services" className="mx-auto max-w-7xl px-6 py-24">
      <Eyebrow>What we do</Eyebrow>
      <h2 className="mt-3 max-w-3xl font-display text-4xl font-bold md:text-5xl">A full-service cooling specialist.</h2>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
        Domestic, commercial and industrial. If it cools, heats, chills or moves air — we work on it.
      </p>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {services.map(({ icon: Icon, title, body }) => (
          <div key={title} className="group rounded-2xl border border-border bg-card p-6 shadow-card transition hover:-translate-y-1 hover:shadow-glow">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-hero-gradient text-white">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-5 font-display text-xl font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="bg-secondary">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-24 md:grid-cols-2">
        <div className="relative">
          <img src="/img/install-zDpL0bpd.jpg" alt="Rybus technician installing an air-conditioner" className="rounded-3xl shadow-card object-cover aspect-[4/5] w-full" />
          <div className="absolute -bottom-6 -right-6 hidden md:block rounded-2xl bg-hero-gradient p-6 text-white shadow-glow">
            <div className="font-display text-3xl font-bold">24/7</div>
            <div className="text-xs uppercase tracking-wider text-white/80">Call-out service</div>
          </div>
        </div>
        <div>
          <Eyebrow>About Rybus</Eyebrow>
          <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">Qualified. Reliable. <span className="text-primary">Cape Town local.</span></h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Rybus (Pty) Ltd is a Cape Town-based air-conditioning and refrigeration company serving residential, commercial and industrial clients. We're fully certified to work on all refrigeration gas types, with a focus on quality workmanship and long-term service relationships.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              ["Manager", "Ryno Horn — 082 232 0386"],
              ["Technical Support", "Jakobus Mouton — 063 951 8791"],
              ["Location", "Based in Durbanville, serving greater Cape Town"],
              ["Commercial", "Service packages available for commercial clients"],
            ].map(([k, v]) => (
              <li key={k} className="flex gap-3 rounded-xl border border-border bg-card p-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <span><span className="font-semibold">{k}:</span> <span className="text-muted-foreground">{v}</span></span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">{children}</div>;
}

function Gallery({ id, eyebrow, title, blurb, images, columns = 3 }: {
  id?: string; eyebrow: string; title: React.ReactNode; blurb?: string;
  images: [string, string][]; columns?: 2 | 3 | 4;
}) {
  const cols = columns === 2 ? "sm:grid-cols-2" : columns === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3";
  return (
    <section id={id} className="mx-auto max-w-7xl px-6 py-24">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-3 max-w-3xl font-display text-4xl font-bold md:text-5xl">{title}</h2>
      {blurb && <p className="mt-4 max-w-3xl text-lg text-muted-foreground">{blurb}</p>}
      <div className={`mt-12 grid gap-5 ${cols}`}>
        {images.map(([src, alt]) => (
          <figure key={src} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            <div className="aspect-[4/3] overflow-hidden">
              <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            </div>
            <figcaption className="p-4 text-sm text-muted-foreground">{alt}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function RecentWork() {
  const items: [string, string][] = [
    ["/img/install-zDpL0bpd.jpg", "Aircon installations"],
    ["/img/coldroom-qZGse_rv.jpg", "Walk-in cold rooms"],
    ["/img/chiller-BSNHa7sr.jpg", "Chillers & rooftop units"],
  ];
  return (
    <section id="gallery" className="bg-secondary">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <Eyebrow>Recent work</Eyebrow>
        <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">Workmanship that lasts.</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {items.map(([src, label]) => (
            <div key={src} className="group relative overflow-hidden rounded-3xl shadow-card">
              <img src={src} alt={label} className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--deep)]/90 via-transparent" />
              <div className="absolute bottom-0 p-6 text-white">
                <div className="font-display text-2xl font-bold">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DuctService() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-card md:p-12">
        <Eyebrow>Ducting Servicing</Eyebrow>
        <h3 className="mt-3 font-display text-2xl font-bold md:text-3xl">Deep-clean of swirl diffusers & ceiling vents</h3>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Dust and mould build-up around supply diffusers reduces airflow, stains ceiling tiles and recirculates contaminants. We strip, wash and refit diffusers and clean surrounding tiles — restoring hygiene and a clean finish.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {[
            ["/img/duct-service-before-D6PL5I67.jpg", "Before"],
            ["/img/duct-service-after-LKMnliFI.jpg", "After"],
          ].map(([src, label]) => (
            <figure key={src} className="relative overflow-hidden rounded-2xl">
              <img src={src} alt={label} className="aspect-[4/3] w-full object-cover" />
              <figcaption className="absolute top-4 left-4 rounded-full bg-background/90 px-3 py-1 text-xs font-bold uppercase tracking-wider">{label}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function CoolingTowers() {
  return (
    <section className="bg-secondary">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-24 md:grid-cols-2">
        <img src="/img/coolingtower-1-C1rYpDfQ.jpg" alt="BAC cooling tower with forced-draft blower and chilled-water pipework" className="rounded-3xl object-cover shadow-card aspect-[4/3]" />
        <div>
          <Eyebrow>Cooling Towers</Eyebrow>
          <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">Industrial heat rejection — supplied & serviced.</h2>
          <p className="mt-4 text-muted-foreground">
            Supply and installation of cooling towers, plus full repairs and maintenance on existing units. We work on BAC, Evapco and other major brands — fans, motors, drift eliminators, fill packs, basins, float valves and water-treatment systems.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "New cooling tower supply & installation",
              "Strip-down cleans, descaling & disinfection",
              "Fan, motor, bearing & belt replacement",
              "Float valves, make-up water & bleed-off controls",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" />{t}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function ContactForm() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", email: "", address: "",
    service_type: "", property_size: "", message: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email) return toast.error("Name, phone and email are required");
    setBusy(true);
    const { error } = await supabase.from("quotes").insert({
      name: form.name.trim().slice(0, 100),
      phone: form.phone.trim().slice(0, 30),
      email: form.email.trim().slice(0, 255),
      address: form.address.trim().slice(0, 500) || null,
      service_type: form.service_type || null,
      property_size: form.property_size.trim().slice(0, 100) || null,
      message: form.message.trim().slice(0, 2000) || null,
    });
    setBusy(false);
    if (error) return toast.error("Could not send. Please call us instead.");
    setSent(true);
    toast.success("Thanks! We'll be in touch shortly.");
    setForm({ name: "", phone: "", email: "", address: "", service_type: "", property_size: "", message: "" });
  };

  return (
    <section id="contact" className="bg-hero-gradient text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 md:grid-cols-2">
        <div>
          <Eyebrow>Request a quote</Eyebrow>
          <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">Tell us about your project.</h2>
          <p className="mt-4 text-white/80">
            Fill in a few details and we'll get back to you with a tailored quotation. For emergencies, call us directly — we're available 24/7.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={`tel:${PHONE}`} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[color:var(--deep)] hover:scale-[1.03] transition-transform">
              <Phone className="h-4 w-4" /> Ryno — 082 232 0386
            </a>
            <a href="tel:+27639518791" className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold backdrop-blur hover:bg-white/20">
              <Phone className="h-4 w-4" /> Jakobus (Tech) — 063 951 8791
            </a>
            <a href={WHATSAPP} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold backdrop-blur hover:bg-white/20">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-3 text-sm">
            <div>
              <h4 className="font-display text-base font-semibold">Call us</h4>
              <p className="mt-2 text-white/80">Ryno — 082 232 0386<br />Jakobus — 063 951 8791</p>
            </div>
            <div>
              <h4 className="font-display text-base font-semibold">Email</h4>
              <p className="mt-2 text-white/80"><a href="mailto:rybus.info@gmail.com" className="hover:text-accent">rybus.info@gmail.com</a></p>
            </div>
            <div>
              <h4 className="font-display text-base font-semibold">Visit</h4>
              <p className="mt-2 text-white/80">44 Mulberry Gardens<br />Goedemoed, Durbanville<br />Cape Town</p>
            </div>
          </div>
        </div>
        <form onSubmit={submit} className="rounded-3xl bg-white/10 p-8 backdrop-blur border border-white/15">
          <div className="space-y-4">
            <Field label="Full name *"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 outline-none focus:border-accent placeholder-white/50" placeholder="Your name" /></Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Phone *"><input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={30} className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 outline-none focus:border-accent placeholder-white/50" placeholder="082…" /></Field>
              <Field label="Email *"><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={255} className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 outline-none focus:border-accent placeholder-white/50" placeholder="you@example.com" /></Field>
            </div>
            <Field label="Address"><input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} maxLength={500} className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 outline-none focus:border-accent placeholder-white/50" placeholder="Where is the job?" /></Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Service required">
                <select value={form.service_type} onChange={(e) => setForm({ ...form, service_type: e.target.value })} className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 outline-none focus:border-accent text-white">
                  {["","Air-conditioning","Refrigeration","Ducting & Ventilation","Heat Pumps","Glycol & Water Chillers","Electricals & Controllers","Ice Machines & Compressors","Air Curtains & Cooling Towers","Solar Hot Water","Other"].map((o) => (
                    <option key={o} value={o} className="text-foreground">{o || "Select a service…"}</option>
                  ))}
                </select>
              </Field>
              <Field label="Property size"><input value={form.property_size} onChange={(e) => setForm({ ...form, property_size: e.target.value })} maxLength={100} className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 outline-none focus:border-accent placeholder-white/50" placeholder="e.g. 80m² or 3 rooms" /></Field>
            </div>
            <Field label="Message"><textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} maxLength={2000} rows={4} className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 outline-none focus:border-accent placeholder-white/50" placeholder="Tell us about the job" /></Field>
            <button disabled={busy} type="submit" className="w-full rounded-full bg-accent-gradient px-6 py-3 font-semibold text-accent-foreground shadow-glow hover:scale-[1.02] transition-transform disabled:opacity-60">
              {busy ? "Sending…" : sent ? "Thanks — we'll be in touch" : "Send request"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-white/70">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12 grid gap-8 md:grid-cols-3 text-sm">
        <div>
          <div className="flex items-center gap-3">
            <img src={logo} alt="Rybus" className="h-10 w-10 rounded-lg object-contain bg-white border border-border" />
            <div className="font-display font-bold text-lg">Rybus (Pty) Ltd</div>
          </div>
          <p className="mt-3 text-muted-foreground">Cool air. Done right. Cape Town's qualified air-conditioning & refrigeration specialists.</p>
        </div>
        <div className="text-muted-foreground">
          <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> 44 Mulberry Gardens, Durbanville</div>
          <div className="mt-2 flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> {PHONE_DISPLAY}</div>
          <div className="mt-2 flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> info@rybus.co.za</div>
          <div className="mt-2 flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Available 24/7 — including weekends & public holidays</div>
        </div>
        <div className="md:text-right text-muted-foreground">
          © {new Date().getFullYear()} Rybus (Pty) Ltd. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <Services />
      <About />
      <RecentWork />
      <Gallery
        id="electricals"
        eyebrow="AC & Refrigeration Electricals"
        title={<>All electricals. All controllers. <span className="text-primary">Fully qualified.</span></>}
        blurb="From control panel builds and VSD installations to PLC controllers, BMS integration, contactor banks and PCB fault finding — we handle every electrical aspect of air-conditioning and refrigeration systems."
        images={electricals}
      />
      <Gallery
        eyebrow="Air Curtains"
        title={<>Keep cool air in. <span className="text-primary">Keep dust, heat & insects out.</span></>}
        blurb="Supply, installation and servicing of air curtains for retail, hospitality and industrial entrances. We work with Thermocold, Alliance and all leading brands — sized correctly for your doorway."
        images={aircurtains}
        columns={4}
      />
      <Gallery
        eyebrow="Cassette AC — Service & Repair"
        title={<>Strip. Clean. <span className="text-primary">Commission.</span></>}
        blurb="Full-service overhauls on ceiling cassette units — Daikin, Samsung, LG, Midea and more. Coil chemical cleans, blower & impeller strip-downs, PCB diagnostics, drain pan service and full commissioning."
        images={cassettes}
      />
      <Gallery
        eyebrow="Compressors"
        title={<>Supply, repair & <span className="text-primary">overhaul.</span></>}
        blurb="Bitzer, Copeland, Carrier and more — semi-hermetic and hermetic compressor supply, installation, repairs and full overhauls. HP/LP and oil-pressure safety controls, gauge panels, contactor banks and Carel/Penn controller wiring done in-house."
        images={compressors}
        columns={4}
      />
      <CoolingTowers />
      <Gallery
        id="ducting"
        eyebrow="Ducting & Ventilation"
        title={<>Air where you need it — <span className="text-primary">moved properly.</span></>}
        blurb="Supply, installation and servicing of galvanised spiral and rectangular ducting, flexible ducting, inline extractor fans (S&P, Elta, Vortice), Curvent roof ventilators, grilles and diffusers. From single bathroom extractors to commercial fresh-air systems."
        images={ducts}
        columns={4}
      />
      <DuctService />
      <Gallery
        eyebrow="Fabrication"
        title={<>Custom-built in <span className="text-primary">our workshop.</span></>}
        blurb="In-house sheet-metal fabrication: bird & hail guards, condenser hail covers, security cages, custom cowls, transitions, plenums and brackets. Galvanised steel, welded mesh, built to fit your unit and site — not a one-size-fits-all import."
        images={fab}
      />
      <Gallery
        id="chillers"
        eyebrow="Glycol & Water Chillers"
        title={<>Process cooling — designed, installed, <span className="text-primary">serviced.</span></>}
        blurb="Packaged air-cooled and water-cooled chillers, glycol loops, buffer tanks and pump sets for process, brewery, dairy, cold-room and HVAC duty. Installation, commissioning, coil cleans, glycol concentration testing, BMS controls and 24/7 breakdowns."
        images={glycol}
        columns={4}
      />
      <ContactForm />
      <Footer />
    </div>
  );
}
