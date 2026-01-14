from sqlalchemy import Column, String, Text, DateTime, JSON, Enum, Numeric, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
import enum

from app.core.database import Base

class AnalysisStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"

class Website(Base):
    __tablename__ = "websites"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    url = Column(String(2048), nullable=False, unique=True, index=True)
    domain = Column(String(255), nullable=False, index=True)
    title = Column(String(500))
    description = Column(Text)
    last_analyzed = Column(DateTime(timezone=True))
    analysis_status = Column(Enum(AnalysisStatus), default=AnalysisStatus.PENDING)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    website_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    analysis_type = Column(String(100), nullable=False)
    status = Column(Enum(AnalysisStatus), default=AnalysisStatus.PENDING)
    result = Column(JSON)
    confidence_score = Column(Numeric(3, 2))
    processing_time_ms = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class TechnologyStack(Base):
    __tablename__ = "technology_stacks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    website_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    category = Column(String(100), nullable=False)  # 'frontend', 'backend', 'database', etc.
    technology = Column(String(200), nullable=False)
    version = Column(String(100))
    confidence = Column(Numeric(3, 2))
    detection_method = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class TrafficData(Base):
    __tablename__ = "traffic_data"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    website_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    data_source = Column(String(100), nullable=False)
    metric_type = Column(String(100), nullable=False)
    metric_value = Column(Integer)
    time_period = Column(String(50))
    recorded_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Competitor(Base):
    __tablename__ = "competitors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    primary_website_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    competitor_website_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    similarity_score = Column(Numeric(3, 2))
    relationship_type = Column(String(100))
    detected_at = Column(DateTime(timezone=True), server_default=func.now())

class Report(Base):
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    website_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    report_type = Column(String(100), nullable=False)
    title = Column(String(500), nullable=False)
    content = Column(JSON)
    export_format = Column(String(50))
    file_path = Column(String(1000))
    created_at = Column(DateTime(timezone=True), server_default=func.now())