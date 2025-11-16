'use client';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type TripFormValues = {
  title: string;
  description: string;
  price: string;
  min_price: string;
  start_date: string;
  end_date: string;
  duration_days: string;
  duration_nights: string;
  destination: string;
  hotel_enabled: boolean;
  hotel_stars: string;
  hotel_name: string;
  airlines: string;
  bagages_kg: string;
  lunch_meal: 'included' | 'not_included';
  transport: string;
};

export type TripFormErrors = Partial<Record<keyof TripFormValues, string>>;

interface TripDetailsFormProps {
  isDark: boolean;
  values: TripFormValues;
  onChange: (values: Partial<TripFormValues>) => void;
  errors?: TripFormErrors;
}

export function TripDetailsForm({ isDark, values, onChange, errors }: TripDetailsFormProps) {
  const labelClass = cn(
    'block text-sm font-medium mb-2',
    isDark ? 'text-gray-200' : 'text-gray-900'
  );
  const helpTextClass = cn('text-xs mt-2', isDark ? 'text-red-300' : 'text-red-600');
  const inputWrapper = cn(
    'flex w-full rounded-md border bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    isDark ? 'border-[#3a2f4a] bg-[#271f36] text-gray-100' : 'border-gray-300 text-gray-900'
  );

  const renderError = (field: keyof TripFormValues, id: string) =>
    errors?.[field] ? (
      <p id={id} className={helpTextClass}>
        {errors[field]}
      </p>
    ) : null;

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className={labelClass}>
            Title *
          </label>
          <Input
            id="title"
            value={values.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Trip headline"
            aria-invalid={Boolean(errors?.title)}
            aria-describedby={errors?.title ? 'trip-title-error' : undefined}
            required
          />
          {renderError('title', 'trip-title-error')}
        </div>

        <div>
          <label htmlFor="description" className={labelClass}>
            Description
          </label>
          <textarea
            id="description"
            rows={6}
            placeholder="Describe the itinerary, inclusions, highlights..."
            value={values.description}
            onChange={(e) => onChange({ description: e.target.value })}
            className={cn(inputWrapper, 'cursor-pointer')}
            aria-invalid={Boolean(errors?.description)}
            aria-describedby={errors?.description ? 'trip-description-error' : undefined}
          />
          {renderError('description', 'trip-description-error')}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className={`text-base font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
          Pricing & Schedule
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className={labelClass}>
              Price *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">DZD</span>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={values.price}
                onChange={(e) => onChange({ price: e.target.value })}
                placeholder="0.00"
                className="pl-12"
                aria-invalid={Boolean(errors?.price)}
                aria-describedby={errors?.price ? 'trip-price-error' : undefined}
              />
            </div>
            {renderError('price', 'trip-price-error')}
          </div>
          <div>
            <label htmlFor="min_price" className={labelClass}>
              Minor Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">DZD</span>
              <Input
                id="min_price"
                type="number"
                min="0"
                step="0.01"
                value={values.min_price}
                onChange={(e) => onChange({ min_price: e.target.value })}
                placeholder="Optional minor fare"
                className="pl-12"
                aria-invalid={Boolean(errors?.min_price)}
                aria-describedby={errors?.min_price ? 'trip-min-price-error' : undefined}
              />
            </div>
            {renderError('min_price', 'trip-min-price-error')}
          </div>
          <div>
            <label htmlFor="start_date" className={labelClass}>
              Start Date *
            </label>
            <Input
              id="start_date"
              type="date"
              lang="en-GB"
              value={values.start_date}
              onChange={(e) => onChange({ start_date: e.target.value })}
              max={values.end_date || undefined}
              aria-invalid={Boolean(errors?.start_date)}
              aria-describedby={errors?.start_date ? 'trip-start-date-error' : undefined}
            />
            {renderError('start_date', 'trip-start-date-error')}
          </div>
          <div>
            <label htmlFor="end_date" className={labelClass}>
              End Date *
            </label>
            <Input
              id="end_date"
              type="date"
              lang="en-GB"
              value={values.end_date}
              min={values.start_date || undefined}
              onChange={(e) => onChange({ end_date: e.target.value })}
              aria-invalid={Boolean(errors?.end_date)}
              aria-describedby={errors?.end_date ? 'trip-end-date-error' : undefined}
            />
            {renderError('end_date', 'trip-end-date-error')}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className={`text-base font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
          Duration & Destination
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="duration_days" className={labelClass}>
              Days *
            </label>
            <div className="relative">
              <Input
                id="duration_days"
                type="number"
                min="1"
                value={values.duration_days}
                onChange={(e) => onChange({ duration_days: e.target.value })}
                placeholder="5"
                aria-invalid={Boolean(errors?.duration_days)}
                aria-describedby={errors?.duration_days ? 'trip-duration-days-error' : undefined}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                days
              </span>
            </div>
            {renderError('duration_days', 'trip-duration-days-error')}
          </div>
          <div>
            <label htmlFor="duration_nights" className={labelClass}>
              Nights *
            </label>
            <div className="relative">
              <Input
                id="duration_nights"
                type="number"
                min="0"
                value={values.duration_nights}
                onChange={(e) => onChange({ duration_nights: e.target.value })}
                placeholder="4"
                aria-invalid={Boolean(errors?.duration_nights)}
                aria-describedby={errors?.duration_nights ? 'trip-duration-nights-error' : undefined}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                nights
              </span>
            </div>
            {renderError('duration_nights', 'trip-duration-nights-error')}
          </div>
        </div>
        <div>
          <label htmlFor="destination" className={labelClass}>
            Destination *
          </label>
          <Input
            id="destination"
            value={values.destination}
            onChange={(e) => onChange({ destination: e.target.value })}
            placeholder="e.g., Antalya, Turkey"
            aria-invalid={Boolean(errors?.destination)}
            aria-describedby={errors?.destination ? 'trip-destination-error' : undefined}
          />
          {renderError('destination', 'trip-destination-error')}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className={`text-base font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
          Hotel
        </h3>
        <label className="inline-flex items-center gap-3 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={values.hotel_enabled}
            onChange={(e) => onChange({ hotel_enabled: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-[#8A77ED] focus:ring-[#8A77ED] cursor-pointer"
          />
          <span className={isDark ? 'text-gray-200' : 'text-gray-900'}>Include hotel details</span>
        </label>
        {values.hotel_enabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="hotel_stars" className={labelClass}>
                Hotel Stars *
              </label>
              <Input
                id="hotel_stars"
                type="number"
                min="1"
                max="5"
                value={values.hotel_stars}
                onChange={(e) => onChange({ hotel_stars: e.target.value })}
                placeholder="5"
                aria-invalid={Boolean(errors?.hotel_stars)}
                aria-describedby={errors?.hotel_stars ? 'trip-hotel-stars-error' : undefined}
              />
              {renderError('hotel_stars', 'trip-hotel-stars-error')}
            </div>
            <div>
              <label htmlFor="hotel_name" className={labelClass}>
                Hotel Name *
              </label>
              <Input
                id="hotel_name"
                value={values.hotel_name}
                onChange={(e) => onChange({ hotel_name: e.target.value })}
                placeholder="e.g., Royal Palace Resort"
                aria-invalid={Boolean(errors?.hotel_name)}
                aria-describedby={errors?.hotel_name ? 'trip-hotel-name-error' : undefined}
              />
              {renderError('hotel_name', 'trip-hotel-name-error')}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className={`text-base font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
          Extras
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="airlines" className={labelClass}>
              Airlines
            </label>
            <Input
              id="airlines"
              value={values.airlines}
              onChange={(e) => onChange({ airlines: e.target.value })}
              placeholder="e.g., Algerian Airlines"
              aria-invalid={Boolean(errors?.airlines)}
              aria-describedby={errors?.airlines ? 'trip-airlines-error' : undefined}
            />
            {renderError('airlines', 'trip-airlines-error')}
          </div>
          <div>
            <label htmlFor="bagages_kg" className={labelClass}>
              Baggage Allowance
            </label>
            <div className="relative">
              <Input
                id="bagages_kg"
                type="number"
                min="0"
                value={values.bagages_kg}
                onChange={(e) => onChange({ bagages_kg: e.target.value })}
                placeholder="56"
                aria-invalid={Boolean(errors?.bagages_kg)}
                aria-describedby={errors?.bagages_kg ? 'trip-baggage-error' : undefined}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                kg
              </span>
            </div>
            {renderError('bagages_kg', 'trip-baggage-error')}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="lunch_meal" className={labelClass}>
              Lunch Meal *
            </label>
            <select
              id="lunch_meal"
              value={values.lunch_meal}
              onChange={(e) => onChange({ lunch_meal: e.target.value as TripFormValues['lunch_meal'] })}
              className={cn(inputWrapper, 'cursor-pointer')}
              aria-invalid={Boolean(errors?.lunch_meal)}
              aria-describedby={errors?.lunch_meal ? 'trip-lunch-error' : undefined}
            >
              <option value="included">Included</option>
              <option value="not_included">Not Included</option>
            </select>
            {renderError('lunch_meal', 'trip-lunch-error')}
          </div>
          <div>
            <label htmlFor="transport" className={labelClass}>
              Transport
            </label>
            <Input
              id="transport"
              value={values.transport}
              onChange={(e) => onChange({ transport: e.target.value })}
              placeholder="e.g., Private bus"
              aria-invalid={Boolean(errors?.transport)}
              aria-describedby={errors?.transport ? 'trip-transport-error' : undefined}
            />
            {renderError('transport', 'trip-transport-error')}
          </div>
        </div>
      </div>
    </div>
  );
}

