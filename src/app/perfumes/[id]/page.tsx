import PerfumeDetail from '@/components/PerfumeDetail'
import RelatedPerfumes from '@/components/RelatedPerfumes'
import BackendStatusBanner from '@/components/BackendStatusBanner'
import ErrorBoundary from '@/components/ErrorBoundary'

export const dynamic = 'force-dynamic'

interface PerfumeDetailPageProps {
  params: {
    id: string
  }
}

export default function PerfumeDetailPage({ params }: PerfumeDetailPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <BackendStatusBanner />
      <ErrorBoundary>
        <PerfumeDetail perfumeId={params.id} />
      </ErrorBoundary>
      <ErrorBoundary>
        <RelatedPerfumes />
      </ErrorBoundary>
    </div>
  )
}
