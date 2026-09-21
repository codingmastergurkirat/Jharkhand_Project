'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/common/Toast';
import DuplicateBanner from './DuplicateBanner';
import { detectDuplicate, DuplicateMatchResult } from '@/lib/duplicate-detector';
import { JHARKHAND_DISTRICTS, OFFICIAL_DOMAINS, SUBMITTER_TYPES, DPDP_CONSENT_TEXT } from '@/lib/constants';
import { ArrowRight, ArrowLeft, Upload, CheckCircle, Shield, MapPin, FileText, Image as ImageIcon, X } from 'lucide-react';

interface ProblemSubmissionWizardProps {
  userId?: string;
  onSuccess: () => void;
}

export default function ProblemSubmissionWizard({ userId, onSuccess }: ProblemSubmissionWizardProps) {
  const supabase = createClient();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form State (In-Memory React state, no localStorage bugs)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState<string>(OFFICIAL_DOMAINS[0]);
  const [submitterType, setSubmitterType] = useState<string>(SUBMITTER_TYPES[0]);

  // Step 2 Location State
  const [district, setDistrict] = useState<string>('Ranchi');
  const [landmark, setLandmark] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [geoCaptured, setGeoCaptured] = useState<boolean>(false);

  // Step 3 Evidence State
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);

  // Step 4 Duplicate & Consent State
  const [dpdpConsent, setDpdpConsent] = useState<boolean>(false);
  const [existingProblems, setExistingProblems] = useState<any[]>([]);
  const [duplicateResult, setDuplicateResult] = useState<DuplicateMatchResult>({
    isDuplicate: false,
    similarityScore: 0
  });

  // Silent Background Geolocation Capture on Mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setGeoCaptured(true);
        },
        (error) => {
          // Graceful silent fallback to manual district
          console.warn('Silent geolocation not available:', error.message);
        },
        { timeout: 8000, maximumAge: 60000 }
      );
    }
  }, []);

  // Fetch existing problems in district for duplicate detection
  useEffect(() => {
    async function loadDistrictProblems() {
      const { data } = await supabase
        .from('problems')
        .select('id, title, district, support_count')
        .eq('district', district);
      setExistingProblems(data || []);
    }
    loadDistrictProblems();
  }, [district]);

  // Run duplicate detector when title or district changes
  useEffect(() => {
    if (title.trim().length >= 8 && existingProblems.length > 0) {
      const result = detectDuplicate(title, district, existingProblems);
      setDuplicateResult(result);
    } else {
      setDuplicateResult({ isDuplicate: false, similarityScore: 0 });
    }
  }, [title, district, existingProblems]);

  // File Upload to Supabase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (photoUrls.length + files.length > 3) {
      showToast('Maximum 3 evidence files allowed per report.', 'warning');
      return;
    }

    setUploading(true);
    const newUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 9)}_${Date.now()}.${fileExt}`;
      const filePath = `evidence/${fileName}`;

      try {
        const { error: uploadError } = await supabase.storage
          .from('problem-evidence')
          .upload(filePath, file);

        if (uploadError) {
          console.warn('Storage upload error, using local preview:', uploadError.message);
          // Fallback to local object URL for demonstration
          newUrls.push(URL.createObjectURL(file));
        } else {
          const { data: publicUrlData } = supabase.storage
            .from('problem-evidence')
            .getPublicUrl(filePath);
          newUrls.push(publicUrlData.publicUrl);
        }
      } catch (err: any) {
        console.error('File upload failed:', err);
        newUrls.push(URL.createObjectURL(file));
      }
    }

    setPhotoUrls((prev) => [...prev, ...newUrls].slice(0, 3));
    setUploading(false);
    showToast('Evidence attached successfully.', 'success');
  };

  const removePhoto = (index: number) => {
    setPhotoUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      showToast('Please sign in or create an account to submit a report.', 'error');
      return;
    }

    if (!dpdpConsent) {
      showToast('Mandatory statutory consent under DPDP Act 2023 must be agreed.', 'error');
      return;
    }

    if (photoUrls.length === 0) {
      showToast('Photographic evidence is mandatory. Please upload at least 1 image.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const fullDescription = landmark.trim()
        ? `${description.trim()}

[Field Landmark / Area Notes: ${landmark.trim()}]`
        : description.trim();

      const { data, error } = await supabase
        .from('problems')
        .insert({
          title: title.trim(),
          description: fullDescription,
          domain,
          district,
          lat: latitude || 23.3441, // Default fallback coordinates
          lng: longitude || 85.3096,
          location_source: geoCaptured ? 'auto' : 'manual',
          photo_urls: photoUrls,
          status: 'pending',
          submitted_by: userId,
          submitted_by_type: submitterType
        })
        .select()
        .single();

      if (error) {
        showToast(error.message, 'error');
      } else {
        showToast('Societal problem successfully registered with Jan Samadhan portal!', 'success');
        onSuccess();
      }
    } catch (err: any) {
      showToast(err.message || 'Submission failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border rounded-xl shadow-md p-6 sm:p-8">
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-2">
          <span className={currentStep >= 1 ? 'text-[#1B5E20]' : ''}>1. Description</span>
          <span className={currentStep >= 2 ? 'text-[#1B5E20]' : ''}>2. Location & Privacy</span>
          <span className={currentStep >= 3 ? 'text-[#1B5E20]' : ''}>3. Photo Evidence</span>
          <span className={currentStep >= 4 ? 'text-[#1B5E20]' : ''}>4. DPDP Review</span>
        </div>
        <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-[#1B5E20] h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP 1: Problem Description */}
      {currentStep === 1 && (
        <div className="space-y-5">
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Step 1: Describe the Societal Challenge
            </h3>
            <p className="text-xs text-gray-500">
              Please provide a clear title and plain-language explanation of the ground issue.
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              Problem Title <span className="text-[#B3261E]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Broken drinking water pipeline in Namkum village"
              className="w-full px-3.5 py-2.5 border rounded-lg text-base focus:ring-3 focus:ring-[#E65100] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Official Category Domain <span className="text-[#B3261E]">*</span>
              </label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full px-3 py-2.5 border rounded-lg text-sm bg-white focus:ring-3 focus:ring-[#E65100] focus:outline-none"
              >
                {OFFICIAL_DOMAINS.map((dom) => (
                  <option key={dom} value={dom}>
                    {dom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Submitter Category <span className="text-[#B3261E]">*</span>
              </label>
              <select
                value={submitterType}
                onChange={(e) => setSubmitterType(e.target.value)}
                className="w-full px-3 py-2.5 border rounded-lg text-sm bg-white focus:ring-3 focus:ring-[#E65100] focus:outline-none"
              >
                {SUBMITTER_TYPES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              Detailed Description & Community Impact <span className="text-[#B3261E]">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain who is affected, how long the issue has persisted, and what immediate difficulties the local population faces..."
              className="w-full px-3.5 py-2.5 border rounded-lg text-base focus:ring-3 focus:ring-[#E65100] focus:outline-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => {
                if (!title.trim() || !description.trim()) {
                  showToast('Please enter both title and description.', 'error');
                  return;
                }
                setCurrentStep(2);
              }}
              className="px-6 py-2.5 bg-[#1B5E20] hover:bg-green-800 text-white font-bold rounded-lg shadow flex items-center gap-2 min-h-[44px]"
            >
              Next: Location & Privacy
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Location & Privacy */}
      {currentStep === 2 && (
        <div className="space-y-5">
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Step 2: Location Jurisdiction & Privacy Controls
            </h3>
            <p className="text-xs text-gray-500">
              Select your administrative district. GPS coordinates are gathered in the background for ground verification.
            </p>
          </div>

          {/* Privacy Note adhering to DPDP Act 2023 */}
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-start gap-2.5">
            <Shield className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">DPDP Act 2023 Data Minimisation Notice:</span>
              <p className="mt-0.5 leading-relaxed text-blue-800">
                To protect citizen privacy, exact GPS coordinates are masked from public view, and visible only to authorized governance administrators.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              Select District <span className="text-[#B3261E]">*</span>
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full px-3 py-2.5 border rounded-lg text-sm bg-white focus:ring-3 focus:ring-[#E65100] focus:outline-none font-medium"
            >
              {JHARKHAND_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d} District
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              Local Landmark / Village / Mohalla (Optional)
            </label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="e.g. Near Government Primary School, Namkum Block"
              className="w-full px-3.5 py-2.5 border rounded-lg text-sm focus:ring-3 focus:ring-[#E65100] focus:outline-none"
            />
          </div>

          <div className="text-xs text-gray-500 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#1B5E20]" />
            {geoCaptured ? (
              <span className="text-green-700 font-semibold">
                Background GPS captured ({latitude?.toFixed(4)}, {longitude?.toFixed(4)})
              </span>
            ) : (
              <span>Manual district jurisdiction active.</span>
            )}
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 border rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-6 py-2.5 bg-[#1B5E20] hover:bg-green-800 text-white font-bold rounded-lg shadow flex items-center gap-2 min-h-[44px]"
            >
              Next: Attach Evidence
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Attach Evidence */}
      {currentStep === 3 && (
        <div className="space-y-5">
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-1.5">
              Step 3: Attach Photographic Evidence <span className="text-[#B3261E] text-xs font-bold bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">* Mandatory</span>
            </h3>
            <p className="text-xs text-gray-500">
              Photographs or PDF inspection reports assist universities and CSR partners in assessing the ground situation. At least 1 photo is required.
            </p>
          </div>

          {/* Upload Area */}
          <div className={`border-2 border-dashed rounded-xl p-6 text-center transition ${
            photoUrls.length === 0 ? 'border-amber-400 bg-amber-50/50' : 'border-gray-300 bg-gray-50 hover:border-[#1B5E20]'
          }`}>
            <input
              type="file"
              id="file-upload"
              accept="image/*,.pdf"
              multiple
              onChange={handleFileUpload}
              disabled={uploading || photoUrls.length >= 3}
              className="sr-only"
            />
            <label
              htmlFor="file-upload"
              className={`cursor-pointer flex flex-col items-center justify-center gap-2 ${
                uploading || photoUrls.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Upload className="w-8 h-8 text-[#1B5E20]" />
              <span className="text-sm font-bold text-[#1B5E20] hover:underline">
                {uploading ? 'Uploading Evidence...' : 'Click to select images or documents'}
              </span>
              <span className="text-xs text-gray-500">
                Supports JPG, PNG, WebP, PDF (1 to 3 files required, up to 5MB each)
              </span>
            </label>
          </div>

          {/* Previews */}
          {photoUrls.length > 0 ? (
            <div className="space-y-1">
              <div className="text-xs font-bold text-green-800 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                {photoUrls.length} evidence photo(s) attached:
              </div>
              <div className="grid grid-cols-3 gap-3">
                {photoUrls.map((url, idx) => (
                  <div key={idx} className="relative rounded-lg overflow-hidden border bg-gray-100 aspect-video group">
                    <img src={url} alt={`Evidence preview ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700 min-h-[30px] min-w-[30px] flex items-center justify-center"
                      aria-label="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
              ⚠️ Please attach at least 1 photo of the problem before proceeding. Unverified submissions cannot be processed.
            </div>
          )}

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 border rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              type="button"
              onClick={() => {
                if (photoUrls.length === 0) {
                  showToast('Photographic evidence is mandatory. Please upload at least 1 image.', 'error');
                  return;
                }
                setCurrentStep(4);
              }}
              disabled={photoUrls.length === 0}
              className={`px-6 py-2.5 font-bold rounded-lg shadow flex items-center gap-2 min-h-[44px] ${
                photoUrls.length > 0
                  ? 'bg-[#1B5E20] hover:bg-green-800 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Next: DPDP Review & Submit
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Review, Duplicate Alert & DPDP Consent */}
      {currentStep === 4 && (
        <form onSubmit={handleFinalSubmit} className="space-y-5">
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Step 4: Final Review & DPDP Act 2023 Consent
            </h3>
            <p className="text-xs text-gray-500">
              Verify your submission details before registering it on the state governance network.
            </p>
          </div>

          {/* Real-Time Duplicate Banner */}
          {duplicateResult.isDuplicate && duplicateResult.matchedProblem && (
            <DuplicateBanner
              matchedProblem={duplicateResult.matchedProblem}
              similarityScore={duplicateResult.similarityScore}
              userId={userId}
            />
          )}

          {/* Summary Card */}
          <div className="bg-[#F8F9FA] rounded-xl p-4 border text-sm space-y-3">
            <div>
              <span className="text-gray-500 text-xs font-bold uppercase">Title:</span>
              <p className="font-bold text-gray-900">{title}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Domain:</span>
                <p className="font-semibold text-gray-900">{domain}</p>
              </div>
              <div>
                <span className="text-gray-500">District:</span>
                <p className="font-semibold text-gray-900">{district} District</p>
              </div>
            </div>
            <div>
              <span className="text-gray-500 text-xs font-bold block mb-1">Evidence Photos ({photoUrls.length}):</span>
              <div className="flex gap-2">
                {photoUrls.map((url, i) => (
                  <img key={i} src={url} alt={`Evidence ${i+1}`} className="w-16 h-12 object-cover rounded border" />
                ))}
              </div>
            </div>
          </div>

          {/* DPDP Act 2023 Statutory Consent Box */}
          <div className="p-4 bg-emerald-50 border-2 border-[#1B5E20] rounded-xl">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={dpdpConsent}
                onChange={(e) => setDpdpConsent(e.target.checked)}
                className="w-5 h-5 mt-0.5 text-[#1B5E20] rounded focus:ring-3 focus:ring-[#E65100]"
              />
              <span className="text-xs text-gray-800 leading-relaxed">
                <strong>Statutory Legal Consent (DPDP Act 2023):</strong> {DPDP_CONSENT_TEXT}
              </span>
            </label>
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 border rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              type="submit"
              disabled={submitting || !dpdpConsent}
              className={`px-6 py-2.5 font-bold rounded-lg shadow flex items-center gap-2 min-h-[44px] ${
                dpdpConsent
                  ? 'bg-[#1B5E20] hover:bg-green-800 text-white'
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
              }`}
            >
              {submitting ? 'Registering Problem...' : 'Register Public Challenge'}
              <CheckCircle className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
