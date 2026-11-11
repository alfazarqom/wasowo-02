import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatIDR } from '../utils/formatters';

type RegionOption = { id: string; name: string };
const REGION_API = 'https://www.emsifa.com/api-wilayah-indonesia/v2';

async function fetchRegions(path: string): Promise<RegionOption[]> {
  const response = await fetch(`${REGION_API}/${path}`, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('Gagal memuat data wilayah. Silakan coba lagi.');
  const data: unknown = await response.json();
  if (!Array.isArray(data)) throw new Error('Format data wilayah tidak valid.');
  return data.filter((item): item is { id: string | number; name: string } =>
    item !== null && typeof item === 'object' && 'id' in item && 'name' in item &&
    (typeof item.id === 'string' || typeof item.id === 'number') && typeof item.name === 'string'
  ).map((item) => ({ id: String(item.id), name: item.name }));
}

function RegionSelect({ label, value, options, disabled, loading, onChange }: {
  label: string; value: string; options: RegionOption[]; disabled?: boolean;
  loading?: boolean; onChange: (value: string) => void;
}) {
  return <div>
    <label className="block text-neutral-300 font-medium mb-1">{label} *</label>
    <select required value={value} disabled={disabled || loading}
      onChange={(event) => onChange(event.target.value)}
      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2.5 text-white focus:border-pink-500 disabled:opacity-50">
      <option value="">{loading ? 'Memuat…' : `Pilih ${label.toLowerCase()}`}</option>
      {options.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
    </select>
  </div>;
}

export function CheckoutPage() {
  const { cart, clearCart, showToast } = useApp();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [regionError, setRegionError] = useState<string | null>(null);
  const [provinces, setProvinces] = useState<RegionOption[]>([]);
  const [regencies, setRegencies] = useState<RegionOption[]>([]);
  const [districts, setDistricts] = useState<RegionOption[]>([]);
  const [villages, setVillages] = useState<RegionOption[]>([]);
  const [loading, setLoading] = useState({ provinces: true, regencies: false, districts: false, villages: false });
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: '', provinceId: '', regencyId: '',
    districtId: '', villageId: '', postalCode: '', deliveryNotes: '',
  });

  const province = provinces.find((item) => item.id === formData.provinceId);
  const regency = regencies.find((item) => item.id === formData.regencyId);
  const district = districts.find((item) => item.id === formData.districtId);
  const village = villages.find((item) => item.id === formData.villageId);

  useEffect(() => {
    let active = true;
    fetchRegions('provinces.json').then((data) => { if (active) setProvinces(data); })
      .catch((error) => { if (active) setRegionError(error instanceof Error ? error.message : 'Gagal memuat provinsi.'); })
      .finally(() => { if (active) setLoading((state) => ({ ...state, provinces: false })); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!formData.provinceId) { setRegencies([]); return; }
    let active = true;
    setLoading((state) => ({ ...state, regencies: true }));
    fetchRegions(`regencies/${encodeURIComponent(formData.provinceId)}.json`)
      .then((data) => { if (active) setRegencies(data); })
      .catch((error) => { if (active) setRegionError(error instanceof Error ? error.message : 'Gagal memuat kabupaten/kota.'); })
      .finally(() => { if (active) setLoading((state) => ({ ...state, regencies: false })); });
    return () => { active = false; };
  }, [formData.provinceId]);

  useEffect(() => {
    if (!formData.regencyId) { setDistricts([]); return; }
    let active = true;
    setLoading((state) => ({ ...state, districts: true }));
    fetchRegions(`districts/${encodeURIComponent(formData.regencyId)}.json`)
      .then((data) => { if (active) setDistricts(data); })
      .catch((error) => { if (active) setRegionError(error instanceof Error ? error.message : 'Gagal memuat kecamatan.'); })
      .finally(() => { if (active) setLoading((state) => ({ ...state, districts: false })); });
    return () => { active = false; };
  }, [formData.regencyId]);

  useEffect(() => {
    if (!formData.districtId) { setVillages([]); return; }
    let active = true;
    setLoading((state) => ({ ...state, villages: true }));
    fetchRegions(`villages/${encodeURIComponent(formData.districtId)}.json`)
      .then((data) => { if (active) setVillages(data); })
      .catch((error) => { if (active) setRegionError(error instanceof Error ? error.message : 'Gagal memuat kelurahan/desa.'); })
      .finally(() => { if (active) setLoading((state) => ({ ...state, villages: false })); });
    return () => { active = false; };
  }, [formData.districtId]);

  const subtotal = cart.reduce((sum, item) => sum + ((item.product.sale_price ?? item.product.price) * item.quantity), 0);
  const shippingCost = 52000;
  const totalAmount = subtotal + shippingCost;
  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((state) => ({ ...state, [field]: value }));
    setRegionError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting || cart.length === 0) return;
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() ||
      !formData.address.trim() || !formData.provinceId || !formData.regencyId ||
      !formData.districtId || !formData.villageId || !formData.postalCode.trim()) {
      setFormError('Lengkapi seluruh kolom alamat dan kontak yang wajib diisi.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const response = await fetch('https://mvwflakurihhakdrlteg.supabase.co/functions/v1/divoom-duitku-create-invoice', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: formData.name, email: formData.email, phone: formData.phone, address: formData.address,
            city: regency?.name ?? '', provinceId: formData.provinceId, provinceName: province?.name ?? '',
            regencyId: formData.regencyId, regencyName: regency?.name ?? '',
            districtId: formData.districtId, districtName: district?.name ?? '',
            villageId: formData.villageId, villageName: village?.name ?? '',
            postalCode: formData.postalCode, deliveryNotes: formData.deliveryNotes,
          },
          items: cart.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload?.success || !payload?.data?.reference || !payload?.data?.merchantOrderId)
        throw new Error(payload?.error || 'Unable to create payment invoice.');
      localStorage.setItem('divoom_pending_payment', JSON.stringify({
        merchantOrderId: payload.data.merchantOrderId, reference: payload.data.reference,
        email: formData.email.trim().toLowerCase(), environment: payload.data.paymentScriptEnvironment,
      }));
      clearCart();
      navigate(`/payment/${payload.data.merchantOrderId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Checkout failed. Please try again.';
      setFormError(message); showToast(message);
    } finally { setSubmitting(false); }
  };

  const inputClass = 'w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2.5 text-white focus:border-pink-500';
  return <div className="space-y-6">
    <h1 className="text-2xl font-bold text-white tracking-tight">Guest Checkout</h1>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4 bg-neutral-800/60 border border-neutral-700 rounded-xl p-6">
        <h2 className="text-base font-bold text-white mb-4">Shipping Contact Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div><label className="block text-neutral-300 font-medium mb-1">Full Name *</label>
            <input required maxLength={120} value={formData.name} onChange={(e) => updateField('name', e.target.value)} className={inputClass} /></div>
          <div><label className="block text-neutral-300 font-medium mb-1">Email Address *</label>
            <input required type="email" maxLength={255} value={formData.email} onChange={(e) => updateField('email', e.target.value)} className={inputClass} /></div>
          <div><label className="block text-neutral-300 font-medium mb-1">Phone Number *</label>
            <input required type="tel" maxLength={50} value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} className={inputClass} /></div>
          <RegionSelect label="Province" value={formData.provinceId} options={provinces} loading={loading.provinces} onChange={(value) => {
            setFormData((state) => ({ ...state, provinceId: value, regencyId: '', districtId: '', villageId: '' }));
            setRegencies([]); setDistricts([]); setVillages([]); setRegionError(null);
          }} />
          <RegionSelect label="Regency / City" value={formData.regencyId} options={regencies} disabled={!formData.provinceId} loading={loading.regencies} onChange={(value) => {
            setFormData((state) => ({ ...state, regencyId: value, districtId: '', villageId: '' }));
            setDistricts([]); setVillages([]); setRegionError(null);
          }} />
          <RegionSelect label="District" value={formData.districtId} options={districts} disabled={!formData.regencyId} loading={loading.districts} onChange={(value) => {
            setFormData((state) => ({ ...state, districtId: value, villageId: '' }));
            setVillages([]); setRegionError(null);
          }} />
          <RegionSelect label="Village / Subdistrict" value={formData.villageId} options={villages} disabled={!formData.districtId} loading={loading.villages} onChange={(value) => updateField('villageId', value)} />
          <div><label className="block text-neutral-300 font-medium mb-1">Postal Code *</label>
            <input required inputMode="numeric" maxLength={10} value={formData.postalCode}
              onChange={(e) => updateField('postalCode', e.target.value.replace(/[^0-9]/g, '').slice(0, 10))} className={inputClass} />
            <p className="text-neutral-500 mt-1">Masukkan kode pos secara manual.</p></div>
          <div className="sm:col-span-2"><label className="block text-neutral-300 font-medium mb-1">Street Address *</label>
            <textarea required maxLength={500} rows={3} value={formData.address} onChange={(e) => updateField('address', e.target.value)}
              placeholder="Nama jalan, nomor rumah, gedung, RT/RW, patokan" className={inputClass}></textarea></div>
          <div className="sm:col-span-2"><label className="block text-neutral-300 font-medium mb-1">Delivery Notes (Optional)</label>
            <textarea maxLength={500} rows={2} value={formData.deliveryNotes} onChange={(e) => updateField('deliveryNotes', e.target.value)}
              placeholder="Petunjuk tambahan untuk kurir" className={inputClass}></textarea></div>
        </div>
        {regionError && <p role="alert" className="text-sm text-red-400">{regionError}</p>}
        {formError && <p role="alert" className="text-sm text-red-400">{formError}</p>}
        <button type="submit" disabled={submitting || cart.length === 0 || loading.provinces}
          className="w-full bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-transform active:scale-98 shadow-lg mt-4">
          {submitting ? 'Preparing secure payment…' : 'Continue to Duitku Payment →'}
        </button>
      </form>
      <div className="bg-neutral-800/80 border border-neutral-700 rounded-xl p-6 h-fit space-y-4">
        <h2 className="text-base font-bold text-white border-b border-neutral-700 pb-3">Cart Total</h2>
        <div className="space-y-2 text-xs">{cart.map((item) => <div key={item.product.id} className="flex justify-between text-neutral-300">
          <span className="truncate max-w-[180px]">{item.product.title} (x{item.quantity})</span>
          <span>{formatIDR((item.product.sale_price ?? item.product.price) * item.quantity)}</span>
        </div>)}</div>
        <div className="border-t border-neutral-700 pt-3 flex justify-between text-neutral-300 text-xs"><span>Subtotal</span><span>{formatIDR(subtotal)}</span></div>
        <div className="flex justify-between text-neutral-300 text-xs"><span>Flat Shipping</span><span>{formatIDR(shippingCost)}</span></div>
        <div className="border-t border-neutral-700 pt-3 flex justify-between font-bold text-white text-sm"><span>Total Payment</span><span className="text-pink-400">{formatIDR(totalAmount)}</span></div>
      </div>
    </div>
  </div>;
}
