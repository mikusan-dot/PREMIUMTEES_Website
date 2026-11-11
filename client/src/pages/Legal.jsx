import { useBrand } from '@/hooks/useStoreSettings';
import { useSeo } from '@/hooks/useSeo';

const Page = ({ title, updated, children }) => (
  <section className="section">
    <div className="container-premium">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-4xl font-bold text-brand-black md:text-5xl">{title}</h1>
        <p className="mb-10 text-xs uppercase tracking-[0.2em] text-brand-muted">Last updated: {updated}</p>
        <div className="space-y-8 leading-relaxed text-brand-charcoal [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-brand-black [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
          {children}
        </div>
      </div>
    </div>
  </section>
);

const Block = ({ id, title, children }) => (
  <div id={id}><h2>{title}</h2>{children}</div>
);

export const Privacy = () => {
  const b = useBrand();
  useSeo({ title: 'Privacy Policy', description: `How ${b.name} collects, uses and protects your personal information.` });
  return (
    <Page title="Privacy Policy" updated="November 2026">
      <p>This policy explains how {b.name} ("we", "us") handles your information when you shop on our website.</p>
      <Block title="Information we collect">
        <ul>
          <li>Order details: name, phone number, email, delivery address and the items you buy.</li>
          <li>Payment status for bKash, Nagad, card or Cash on Delivery orders. We do not store full card numbers.</li>
          <li>Basic usage data (pages visited, device type) to keep the site working and improve it.</li>
        </ul>
      </Block>
      <Block title="How we use it">
        <ul>
          <li>To process, deliver and support your orders, including order and delivery notifications.</li>
          <li>To prevent fraud and keep the store secure.</li>
          <li>To send newsletters only if you subscribed; you can unsubscribe at any time.</li>
        </ul>
      </Block>
      <Block title="Sharing">
        <p>We share only what is needed with delivery partners and payment providers to fulfil your order. We do not sell your personal information.</p>
      </Block>
      <Block title="Your choices">
        <p>You can ask us to access, correct or delete your information at any time by contacting <a className="underline" href={`mailto:${b.email}`}>{b.email}</a>.</p>
      </Block>
    </Page>
  );
};

export const Terms = () => {
  const b = useBrand();
  useSeo({ title: 'Terms & Conditions', description: `Terms of purchase, shipping and returns for ${b.name}.` });
  return (
    <Page title="Terms & Conditions" updated="November 2026">
      <p>By placing an order with {b.name} you agree to these terms.</p>
      <Block title="Orders & pricing">
        <p>All prices are in Bangladeshi Taka (৳). We may cancel an order if an item is unavailable or a pricing error occurs, and will refund any payment made.</p>
      </Block>
      <Block id="shipping" title="Shipping & delivery">
        <p>We deliver across Bangladesh. Delivery charges differ inside and outside Dhaka and are shown at checkout. Cash on Delivery is available nationwide.</p>
      </Block>
      <Block title="Returns & exchanges">
        <p>If an item arrives damaged or the wrong size, contact us within 3 days of delivery at <a className="underline" href={`mailto:${b.email}`}>{b.email}</a> with your order number and a photo. Items must be unworn and unwashed with tags attached to be eligible.</p>
      </Block>
      <Block title="Intellectual property">
        <p>The {b.name} name, logo, designs and site content are our property and may not be reused without permission.</p>
      </Block>
      <Block title="Contact">
        <p>Questions? Email <a className="underline" href={`mailto:${b.email}`}>{b.email}</a>.</p>
      </Block>
    </Page>
  );
};
