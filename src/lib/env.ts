export const getClerkPublishableKey = () => {
  return (
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ??
    import.meta.env.VITE_PUBLIC_CLERK_PUBLISHABLE_KEY ??
    ""
  );
};