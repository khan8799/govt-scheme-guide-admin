import React from 'react';
import Image from 'next/image';
import { parseBulletPoints } from '@/utils/textParsing';
import { Scheme } from '@/app/types/scheme';

interface SchemeDetailsModalProps {
  scheme: Scheme | null;
  onClose: () => void;
  onEdit: (id: string) => void;
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="my-6">
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <div>{children}</div>
  </div>
);

const SchemeDetailsModal: React.FC<SchemeDetailsModalProps> = React.memo(({ scheme, onClose, onEdit }) => {
  if (!scheme) return null;

  const handleEdit = () => {
    onClose();
    onEdit(scheme._id);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold">{scheme.schemeTitle}</h2>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {scheme.bannerImage && (
            <div className="mb-6 rounded-lg overflow-hidden relative h-48">
              <Image src={scheme.bannerImage.url} alt="Banner" fill className="object-cover" sizes="800px" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {scheme.cardImage && (
              <div className="rounded-lg overflow-hidden relative h-32">
                <Image src={scheme.cardImage.url} alt="Card" fill className="object-cover" sizes="400px" />
              </div>
            )}
            <div className="flex flex-col justify-center">
              {scheme.isFeatured && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mb-2">
                  Featured Scheme
                </span>
              )}
              {scheme.isActive !== undefined && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  scheme.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {scheme.isActive ? 'Active' : 'Inactive'}
                </span>
              )}
            </div>
          </div>

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

          {(scheme.excerpt || scheme.seoTitle || scheme.seoMetaDescription) && (
            <Section title="SEO & Content">
              {scheme.excerpt && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2 text-gray-700">Excerpt</h4>
                  <p className="text-gray-700">{scheme.excerpt}</p>
                </div>
              )}
              {scheme.seoTitle && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2 text-gray-700">SEO Title</h4>
                  <p className="text-gray-700">{scheme.seoTitle}</p>
                </div>
              )}
              {scheme.seoMetaDescription && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2 text-gray-700">SEO Meta Description</h4>
                  <p className="text-gray-700">{scheme.seoMetaDescription}</p>
                </div>
              )}
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

          {scheme.helplineNumber && (
            <Section title="Helpline Number">
              <p><strong>Toll Free:</strong> {scheme.helplineNumber.tollFreeNumber || 'N/A'}</p>
              <p><strong>Email:</strong> {scheme.helplineNumber.emailSupport || 'N/A'}</p>
              <p><strong>Availability:</strong> {scheme.helplineNumber.availability || 'N/A'}</p>
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

          {scheme.sourcesAndReferences && scheme.sourcesAndReferences.length > 0 && (
            <Section title="Sources & References">
              <ul className="list-disc list-inside space-y-2">
                {scheme.sourcesAndReferences.map((source, index) => (
                  <li key={source._id || index}>
                    <strong>{source.sourceName}</strong>: <a href={source.sourceLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{source.sourceLink}</a>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {scheme.textWithHTMLParsing?.htmlDescription && (
            <Section title="Detailed Content">
              <div 
                className="html-content"
                style={{
                  lineHeight: '1.6',
                  fontSize: '16px'
                }}
                dangerouslySetInnerHTML={{ __html: scheme.textWithHTMLParsing.htmlDescription }}
              />
            </Section>
          )}

          {scheme.author && (
            <Section title="Author">
              <p><strong>Name:</strong> {scheme.author.name}</p>
              <p><strong>Email:</strong> {scheme.author.email}</p>
            </Section>
          )}

          {(scheme.createdAt || scheme.updatedAt) && (
            <Section title="Metadata">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                {scheme.createdAt && (
                  <div>
                    <strong>Created:</strong> {new Date(scheme.createdAt).toLocaleString()}
                    {scheme.createdBy && <span> by {scheme.createdBy.name}</span>}
                  </div>
                )}
                {scheme.updatedAt && (
                  <div>
                    <strong>Last Updated:</strong> {new Date(scheme.updatedAt).toLocaleString()}
                    {scheme.updatedBy && <span> by {scheme.updatedBy.name}</span>}
                  </div>
                )}
              </div>
            </Section>
          )}

          {scheme.disclaimer?.description && (
            <Section title="Disclaimer">
              <p>{scheme.disclaimer.description}</p>
            </Section>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center">
            <button 
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Edit Scheme
            </button>
            <button onClick={onClose} className="px-4 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
});

SchemeDetailsModal.displayName = 'SchemeDetailsModal';

export default SchemeDetailsModal;