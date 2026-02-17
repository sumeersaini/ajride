export const calculateFare = (distanceKm, pricingConfig) => {
  if (!distanceKm || !pricingConfig) return null;

  const {
    start_price,
    price_per_km,
    platform_fee
  } = pricingConfig;

  const distance = parseFloat(distanceKm);
  const totalFare = (
    start_price +
    distance * price_per_km +
    platform_fee
  ).toFixed(2);

  return totalFare;
};
