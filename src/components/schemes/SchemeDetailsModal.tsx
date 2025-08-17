"use client";
import React from 'react';
import Image from 'next/image';
import { Scheme } from '@/app/types/scheme';
import { parseBulletPoints } from '@/utils/textParsing';

interface SchemeDetailsModalProps {
  scheme: Scheme;
  onClose: () => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="font-semibold text-lg mb-3 text-gray-800">{title}</h3>
    <div>{children}</div>
  </div>
);

const SchemeDetailsModal: React.FC<SchemeDetailsModalProps> = ({ scheme, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">{scheme.schemeTitle}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {scheme.bannerImage && (
            <div className="mb-4 rounded-lg overflow-hidden relative h-48">
              <Image src={scheme.bannerImage.url} alt="Banner" fill className="object-cover" sizes="800px" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-gray-700">{scheme.about}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Objectives</h3>
              <p className="text-gray-700">{scheme.objectives}</p>
            </div>
          </div>

          {scheme.keyHighlightsOfTheScheme?.length > 0 && (
            <Section title="Key Highlights">
              <ul className="list-disc pl-5 space-y-1">
                {scheme.keyHighlightsOfTheScheme.map((item) => (
                  <li key={item._id}>
                    <strong>{item.schemeName}</strong> – {item.launchedBy}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {scheme.eligibilityCriteria?.length > 0 && (
            <Section title="Eligibility Criteria">
              {scheme.eligibilityCriteria.map((item) => {
                const bulletPoints = parseBulletPoints(item.subDescription);
                return (
                  <div key={item._id} className="mb-4">
                    {item.subTitle && (
                      <h4 className="font-medium mb-2 text-gray-700">{item.subTitle}</h4>
                    )}
                    {bulletPoints.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {bulletPoints.map((point, index) => (
                          <li key={index} className="text-gray-700">{point}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-700">{item.subDescription}</p>
                    )}
                  </div>
                );
              })}
            </Section>
          )}

          {scheme.financialBenefits?.length > 0 && (
            <Section title="Financial Benefits">
              {scheme.financialBenefits.map((item) => {
                const bulletPoints = parseBulletPoints(item.subDescription);
                return (
                  <div key={item._id} className="mb-4">
                    {item.subTitle && (
                      <h4 className="font-medium mb-2 text-gray-700">{item.subTitle}</h4>
                    )}
                    {bulletPoints.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {bulletPoints.map((point, index) => (
                          <li key={index} className="text-gray-700">{point}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-700">{item.subDescription}</p>
                    )}
                  </div>
                );
              })}
            </Section>
          )}

          {scheme.requiredDocuments?.length > 0 && (
            <Section title="Required Documents">
              {scheme.requiredDocuments.map((item) => {
                const bulletPoints = parseBulletPoints(item.subDescription);
                return (
                  <div key={item._id} className="mb-4">
                    {item.subTitle && (
                      <h4 className="font-medium mb-2 text-gray-700">{item.subTitle}</h4>
                    )}
                    {bulletPoints.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {bulletPoints.map((point, index) => (
                          <li key={index} className="text-gray-700">{point}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-700">{item.subDescription}</p>
                    )}
                  </div>
                );
              })}
            </Section>
          )}

          {scheme.importantDates?.length > 0 && (
            <Section title="Important Dates">
              <ul className="space-y-1">
                {scheme.importantDates.map((date) => (
                  <li key={date._id}>
                    <strong>{date.label}:</strong> {new Date(date.date).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {scheme.salientFeatures?.length > 0 && (
            <Section title="Salient Features">
              {scheme.salientFeatures.map((item) => {
                const bulletPoints = parseBulletPoints(item.subDescription);
                return (
                  <div key={item._id} className="mb-4">
                    {item.subTitle && (
                      <h4 className="font-medium mb-2 text-gray-700">{item.subTitle}</h4>
                    )}
                    {bulletPoints.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {bulletPoints.map((point, index) => (
                          <li key={index} className="text-gray-700">{point}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-700">{item.subDescription}</p>
                    )}
                  </div>
                );
              })}
            </Section>
          )}

          {scheme.applicationProcess?.length > 0 && (
            <Section title="Application Process">
              {scheme.applicationProcess.map((item) => {
                const bulletPoints = parseBulletPoints(item.subDescription);
                return (
                  <div key={item._id} className="mb-4">
                    {item.subTitle && (
                      <h4 className="font-medium mb-2 text-gray-700">{item.subTitle}</h4>
                    )}
                    {bulletPoints.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {bulletPoints.map((point, index) => (
                          <li key={index} className="text-gray-700">{point}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-700">{item.subDescription}</p>
                    )}
                  </div>
                );
              })}
            </Section>
          )}

          {scheme.helplineNumber && (
            <Section title="Helpline Number">
              <p>
                <strong>Toll Free:</strong> {scheme.helplineNumber.tollFreeNumber || 'N/A'}
              </p>
              <p>
                <strong>Email:</strong> {scheme.helplineNumber.emailSupport || 'N/A'}
              </p>
              <p>
                <strong>Availability:</strong> {scheme.helplineNumber.availability || 'N/A'}
              </p>
            </Section>
          )}

          {scheme.frequentlyAskedQuestions?.length > 0 && (
            <Section title="Frequently Asked Questions">
              <ul className="space-y-2">
                {scheme.frequentlyAskedQuestions.map((faq) => (
                  <li key={faq._id}>
                    <strong>Q:</strong> {faq.question}
                    <br />
                    <strong>A:</strong> {faq.answer}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {scheme.sourcesAndReferences && (
            <Section title="Sources & References">
              <p>
                <strong>{scheme.sourcesAndReferences.sourceName}</strong>: {scheme.sourcesAndReferences.sourceLink}
              </p>
            </Section>
          )}

          {scheme.disclaimer?.description && (
            <Section title="Disclaimer">
              <p>{scheme.disclaimer.description}</p>
            </Section>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200 text-right">
            <button onClick={onClose} className="px-4 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchemeDetailsModal;


