// src/pages/Home.jsx   (or wherever this lives)
import SignupHero from "../components/SignupHero";
import Card from "../components/Card";
import ContactSection from "../components/ContactSection";

export default function Home() {
  return (
    <>
      <SignupHero />
      <section id="about">
        <Card />
      </section>

      <section id="contact">
        <ContactSection />
      </section>
    </>
  );
}
