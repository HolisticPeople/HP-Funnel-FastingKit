export default function ThankYou() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="text-center max-w-xl">
        <h1 className="text-3xl font-bold mb-2">Thank you!</h1>
        <p className="text-muted-foreground mb-6">Your order has been received.</p>
        <a
          href="/"
          className="inline-block px-5 py-3 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition"
        >
          Explore the best vegan dietary supplement on HolisticPeople!
        </a>
      </div>
    </div>
  );
}


